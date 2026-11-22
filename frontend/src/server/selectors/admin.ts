import "server-only";
import { and, desc, eq, gte, ne, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { accounts, transactions, users } from "@/server/db/schema";
import { HttpError } from "@/server/http";
import type { AdminCustomer, AdminCustomerSummary, AdminStats } from "@/types/admin";
import { accountsForUser, billsForUser, cardsForUser } from "./banking";

export async function listCustomers(): Promise<AdminCustomerSummary[]> {
  const balances = db()
    .select({
      userId: accounts.userId,
      accountCount: sql<string>`count(distinct ${accounts.id})`.as("account_count"),
      total: sql<string>`coalesce(sum(case
        when ${transactions.status} = 'failed' then 0
        when ${transactions.direction} = 'credit' then ${transactions.amount}
        else -(${transactions.amount} + ${transactions.fee}) end), 0)`.as("total"),
    })
    .from(accounts)
    .leftJoin(transactions, eq(transactions.accountId, accounts.id))
    .groupBy(accounts.userId)
    .as("balances");

  const rows = await db()
    .select({ user: users, accountCount: balances.accountCount, total: balances.total })
    .from(users)
    .leftJoin(balances, eq(balances.userId, users.id))
    .where(eq(users.role, "customer"))
    .orderBy(desc(users.createdAt));

  return rows.map(({ user, accountCount, total }) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    theme: user.theme ?? "fernway-ember",
    disabled: user.disabledAt !== null,
    accountCount: Number(accountCount ?? 0),
    totalBalance: Number(total ?? 0),
    createdAt: user.createdAt.toISOString(),
  }));
}

export async function getCustomer(userId: string): Promise<AdminCustomer> {
  const [user] = await db()
    .select()
    .from(users)
    .where(and(eq(users.id, userId), eq(users.role, "customer")))
    .limit(1);
  if (!user) throw new HttpError(404, "That customer doesn't exist.");
  const [customerAccounts, customerCards, customerBills] = await Promise.all([
    accountsForUser(userId),
    cardsForUser(userId),
    billsForUser(userId),
  ]);
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    addressLine1: user.addressLine1,
    city: user.city,
    state: user.state,
    postalCode: user.postalCode,
    disabled: user.disabledAt !== null,
    theme: user.theme ?? "fernway-ember",
    createdAt: user.createdAt.toISOString(),
    accounts: customerAccounts,
    cards: customerCards,
    bills: customerBills,
  };
}

export async function adminStats(now = new Date()): Promise<AdminStats> {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [[people], [ledger], [month]] = await Promise.all([
    db()
      .select({
        customers: sql<string>`count(*)`,
        active: sql<string>`count(*) filter (where ${users.disabledAt} is null)`,
      })
      .from(users)
      .where(eq(users.role, "customer")),
    db()
      .select({
        accounts: sql<string>`(select count(*) from ${accounts})`,
        balance: sql<string>`coalesce(sum(case
          when ${transactions.status} = 'failed' then 0
          when ${transactions.direction} = 'credit' then ${transactions.amount}
          else -(${transactions.amount} + ${transactions.fee}) end), 0)`,
        lastEnteredAt: sql<Date | null>`max(${transactions.createdAt})`,
      })
      .from(transactions),
    db()
      .select({
        count: sql<string>`count(*)`,
        moneyIn: sql<string>`coalesce(sum(${transactions.amount}) filter (where ${transactions.direction} = 'credit'), 0)`,
        moneyOut: sql<string>`coalesce(sum(${transactions.amount} + ${transactions.fee}) filter (where ${transactions.direction} = 'debit'), 0)`,
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.occurredAt, monthStart),
          ne(transactions.status, "failed"),
          ne(transactions.channel, "internal"),
        ),
      ),
  ]);
  return {
    customers: Number(people.customers),
    activeCustomers: Number(people.active),
    accounts: Number(ledger.accounts),
    totalBalance: Number(ledger.balance),
    monthLabel: now.toLocaleDateString("en-US", { month: "long" }),
    moneyInThisMonth: Number(month.moneyIn),
    moneyOutThisMonth: Number(month.moneyOut),
    transactionsThisMonth: Number(month.count),
    lastEnteredAt: ledger.lastEnteredAt ? new Date(ledger.lastEnteredAt).toISOString() : null,
  };
}
