import "server-only";
import { and, eq, sql } from "drizzle-orm";
import type { AccountOpenInput, BillInput, CardIssueInput, TransactionInput } from "@/schemas/admin";
import { db, type Database } from "@/server/db/client";
import { accounts, bills, cards, cryptoTrades, type TransactionRow, transactions, users } from "@/server/db/schema";
import { HttpError } from "@/server/http";
import { formatMoney } from "@/lib/money";
import { cardExpiry, DEFAULT_ROUTING_NUMBER, newAccountNumber, newCardLast4, newReference } from "./numbers";

export type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

/** Locks the account row so concurrent ledger writes on it run one at a time. */
export async function lockAccount(tx: Tx, accountId: string) {
  const [account] = await tx.select().from(accounts).where(eq(accounts.id, accountId)).for("update").limit(1);
  if (!account) throw new HttpError(404, "That account doesn't exist.");
  return account;
}

async function ledgerBalance(tx: Tx, accountId: string): Promise<number> {
  const [row] = await tx
    .select({
      balance: sql<string>`coalesce(sum(case
        when ${transactions.status} = 'failed' then 0
        when ${transactions.direction} = 'credit' then ${transactions.amount}
        else -(${transactions.amount} + ${transactions.fee}) end), 0)`,
    })
    .from(transactions)
    .where(eq(transactions.accountId, accountId));
  return Number(row.balance);
}

/** Accounts never go below $0. Checked after the write, inside the same database transaction. */
export async function assertNotOverdrawn(tx: Tx, accountId: string, accountName: string) {
  const balance = await ledgerBalance(tx, accountId);
  if (balance < 0) {
    throw new HttpError(422, "This would overdraw the account.", {
      amount: `${accountName} would go to ${formatMoney(balance, "USD")}. Add the money coming in first, or lower this amount.`,
    });
  }
}

/**
 * What the customer can spend right now: the ledger balance minus money still arriving.
 * Customer-initiated debits (transfers, trades) must stay within it.
 */
async function availableBalance(tx: Tx, accountId: string): Promise<number> {
  const [row] = await tx
    .select({
      available: sql<string>`coalesce(sum(case
        when ${transactions.status} = 'failed' then 0
        when ${transactions.direction} = 'credit' and ${transactions.status} = 'pending' then 0
        when ${transactions.direction} = 'credit' then ${transactions.amount}
        else -(${transactions.amount} + ${transactions.fee}) end), 0)`,
    })
    .from(transactions)
    .where(eq(transactions.accountId, accountId));
  return Number(row.available);
}

/** Checked after the debit is written, inside the same database transaction, so it rolls back. */
export async function assertAvailable(tx: Tx, accountId: string, message: (availableBefore: string) => string, debited: number) {
  const available = await availableBalance(tx, accountId);
  if (available < 0) {
    throw new HttpError(422, "Not enough money available.", { amount: message(formatMoney(available + debited, "USD")) });
  }
}

/** Serialises crypto trades for one customer, so two sells can't spend the same coins. */
export async function lockCryptoFor(tx: Tx, userId: string) {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`crypto:${userId}`}))`);
}

/** Coins of each symbol the customer holds now (sum of trades). */
export async function holdingsOf(tx: Tx, userId: string): Promise<Map<string, number>> {
  const rows = await tx
    .select({
      symbol: cryptoTrades.symbol,
      quantity: sql<string>`sum(case when ${cryptoTrades.side} = 'buy' then ${cryptoTrades.quantity} else -${cryptoTrades.quantity} end)`,
    })
    .from(cryptoTrades)
    .where(eq(cryptoTrades.userId, userId))
    .groupBy(cryptoTrades.symbol);
  return new Map(rows.map((row) => [row.symbol, Number(row.quantity)]));
}

async function linkedTrade(tx: Tx, transactionId: string) {
  const [trade] = await tx.select().from(cryptoTrades).where(eq(cryptoTrades.transactionId, transactionId)).limit(1);
  return trade;
}

async function assertCardOnAccount(tx: Tx, cardId: string | null, accountId: string) {
  if (!cardId) return;
  const [card] = await tx
    .select({ id: cards.id })
    .from(cards)
    .where(and(eq(cards.id, cardId), eq(cards.accountId, accountId)))
    .limit(1);
  if (!card) throw new HttpError(422, "That card doesn't spend from this account.", { cardId: "Choose a card on this account." });
}

function values(input: TransactionInput) {
  return {
    direction: input.direction,
    amount: input.amount,
    fee: input.direction === "debit" ? input.fee : 0,
    counterparty: input.counterparty,
    counterpartyDetail: input.counterpartyDetail,
    narration: input.narration,
    category: input.category,
    channel: input.channel,
    status: input.status,
    occurredAt: new Date(input.occurredAt),
    cardId: input.channel === "card" ? input.cardId : null,
  };
}

export async function addTransaction(accountId: string, input: TransactionInput, adminId: string): Promise<TransactionRow> {
  return db().transaction(async (tx) => {
    const account = await lockAccount(tx, accountId);
    await assertCardOnAccount(tx, input.channel === "card" ? input.cardId : null, accountId);
    const [row] = await tx
      .insert(transactions)
      .values({ ...values(input), accountId, reference: newReference(), enteredBy: adminId })
      .returning();
    await assertNotOverdrawn(tx, accountId, account.name);
    return row;
  });
}

export async function updateTransaction(transactionId: string, input: TransactionInput): Promise<TransactionRow> {
  return db().transaction(async (tx) => {
    const [existing] = await tx.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);
    if (!existing) throw new HttpError(404, "That transaction doesn't exist.");
    if (await linkedTrade(tx, transactionId)) {
      throw new HttpError(422, "This is a crypto trade, so it can't be edited. Delete it and record it again.");
    }
    const account = await lockAccount(tx, existing.accountId);
    await assertCardOnAccount(tx, input.channel === "card" ? input.cardId : null, existing.accountId);
    const [row] = await tx.update(transactions).set(values(input)).where(eq(transactions.id, transactionId)).returning();
    await assertNotOverdrawn(tx, existing.accountId, account.name);
    return row;
  });
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  await db().transaction(async (tx) => {
    const [existing] = await tx.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);
    if (!existing) throw new HttpError(404, "That transaction doesn't exist.");
    const account = await lockAccount(tx, existing.accountId);
    const trade = await linkedTrade(tx, transactionId);
    if (trade) await lockCryptoFor(tx, trade.userId);
    // Deleting the cash side of a trade deletes the trade too (cascade).
    await tx.delete(transactions).where(eq(transactions.id, transactionId));
    if (trade?.side === "buy" && ((await holdingsOf(tx, trade.userId)).get(trade.symbol) ?? 0) < -1e-10) {
      throw new HttpError(422, `Those ${trade.symbol} were sold later. Delete the sale first.`);
    }
    // Removing money that came in can leave later spending uncovered.
    await assertNotOverdrawn(tx, existing.accountId, account.name);
  });
}

export async function openAccount(userId: string, input: AccountOpenInput) {
  const [owner] = await db().select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  if (!owner || owner.role !== "customer") throw new HttpError(404, "That customer doesn't exist.");
  const [account] = await db()
    .insert(accounts)
    .values({
      userId,
      type: input.type,
      name: input.name,
      accountNumber: newAccountNumber(),
      routingNumber: DEFAULT_ROUTING_NUMBER,
      apyBps: input.type === "savings" ? input.apyBps : 0,
      goalName: input.goalName,
      goalTarget: input.goalTarget,
    })
    .returning();
  return account;
}

export async function issueCard(userId: string, input: CardIssueInput) {
  const [owner] = await db()
    .select({ firstName: users.firstName, lastName: users.lastName })
    .from(users)
    .innerJoin(accounts, and(eq(accounts.userId, users.id), eq(accounts.id, input.accountId)))
    .where(eq(users.id, userId))
    .limit(1);
  if (!owner) throw new HttpError(422, "Choose one of this customer's accounts.", { accountId: "Choose one of this customer's accounts." });
  const [card] = await db()
    .insert(cards)
    .values({
      userId,
      accountId: input.accountId,
      label: input.label,
      kind: input.kind,
      last4: newCardLast4(),
      expiry: cardExpiry(),
      holderName: `${owner.firstName} ${owner.lastName}`.toUpperCase(),
      monthlyLimit: input.monthlyLimit,
    })
    .returning();
  return card;
}

export async function addBill(userId: string, input: BillInput) {
  const [account] = await db()
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, input.accountId), eq(accounts.userId, userId)))
    .limit(1);
  if (!account) throw new HttpError(422, "Choose one of this customer's accounts.", { accountId: "Choose one of this customer's accounts." });
  const [bill] = await db().insert(bills).values({ ...input, userId }).returning();
  return bill;
}

export async function deleteBill(billId: string) {
  const [bill] = await db().delete(bills).where(eq(bills.id, billId)).returning({ userId: bills.userId });
  if (!bill) throw new HttpError(404, "That bill doesn't exist.");
  return bill.userId;
}

/** Customer-facing card controls. Scoped to the owner. */
export async function updateCardSettings(userId: string, cardId: string, update: { frozen?: boolean; onlinePayments?: boolean }) {
  const [card] = await db()
    .update(cards)
    .set(update)
    .where(and(eq(cards.id, cardId), eq(cards.userId, userId)))
    .returning();
  if (!card) throw new HttpError(404, "This card no longer exists.");
  return card;
}
