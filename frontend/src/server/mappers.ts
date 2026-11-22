import "server-only";
import type { AccountRow, CardRow, TransactionRow, UserRow } from "@/server/db/schema";
import type { Account, PaymentCard, Transaction, User } from "@/types/banking";

/** Row → API shapes. The API never exposes password hashes, sessions or admin-only columns. */

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    role: row.role,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    theme: row.theme ?? "fernway-ember",
  };
}

export function toAccount(row: AccountRow, balance: number, availableBalance: number): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    currency: "USD",
    balance,
    availableBalance,
    accountNumber: row.accountNumber,
    routingNumber: row.routingNumber,
    ...(row.type === "savings" ? { apy: row.apyBps / 100 } : {}),
    ...(row.goalName && row.goalTarget ? { goal: { name: row.goalName, target: row.goalTarget } } : {}),
  };
}

export function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    accountId: row.accountId,
    direction: row.direction,
    amount: row.amount,
    fee: row.fee,
    currency: "USD",
    counterparty: row.counterparty,
    ...(row.counterpartyDetail ? { counterpartyDetail: row.counterpartyDetail } : {}),
    narration: row.narration,
    category: row.category,
    channel: row.channel,
    status: row.status,
    reference: row.reference,
    createdAt: row.occurredAt.toISOString(),
  };
}

export function toCard(row: CardRow, spentThisMonth: number): PaymentCard {
  return {
    id: row.id,
    accountId: row.accountId,
    label: row.label,
    brand: row.brand,
    kind: row.kind,
    last4: row.last4,
    expiry: row.expiry,
    holderName: row.holderName,
    frozen: row.frozen,
    onlinePayments: row.onlinePayments,
    currency: "USD",
    monthlyLimit: row.monthlyLimit,
    spentThisMonth,
  };
}
