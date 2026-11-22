/**
 * Pure calculations over a customer's ledger. Used by the server selectors and by the
 * in-browser data source, so both always agree. Amounts are cents.
 */
import { siteConfig } from "@/config/site";
import type {
  Account,
  BalanceHistory,
  CashFlowWeek,
  MonthSummary,
  SpendingCategory,
  Transaction,
  TrendPoint,
  UpcomingPayment,
} from "@/types/banking";

const time = (tx: Transaction) => new Date(tx.createdAt).getTime();

/** Money moving in or out of the customer, excluding moves between their own accounts. */
export function countsTowardFlow(tx: Transaction): boolean {
  return tx.status !== "failed" && tx.channel !== "internal";
}

/** Signed effect of a transaction on its account's balance. */
export function balanceEffect(tx: Transaction): number {
  if (tx.status === "failed") return 0;
  return tx.direction === "credit" ? tx.amount : -(tx.amount + tx.fee);
}

function sumOut(transactions: Transaction[], from: number, to: number): number {
  return transactions
    .filter((tx) => tx.direction === "debit" && countsTowardFlow(tx) && time(tx) >= from && time(tx) < to)
    .reduce((sum, tx) => sum + tx.amount + tx.fee, 0);
}

export function monthSummary(transactions: Transaction[], now = new Date()): MonthSummary {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const previousSameDay = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() + 1).getTime();

  const totals = new Map<SpendingCategory["category"], number>();
  let moneyIn = 0;
  for (const tx of transactions) {
    if (!countsTowardFlow(tx) || time(tx) < monthStart) continue;
    if (tx.direction === "credit") moneyIn += tx.amount;
    else totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount + tx.fee);
  }
  const categories = [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    currency: siteConfig.defaultCurrency,
    periodLabel: now.toLocaleDateString(siteConfig.locale, { month: "long" }),
    moneyIn,
    moneyOut: categories.reduce((sum, item) => sum + item.amount, 0),
    previousMoneyOut: sumOut(transactions, previousStart, previousSameDay),
    categories,
  };
}

export interface RecurringBillInput {
  id: string;
  payee: string;
  category: UpcomingPayment["category"];
  amount: number;
  dayOfMonth: number;
  autopay: boolean;
}

/** The next date a bill falls due on or after today. */
export function nextDueDate(day: number, from = new Date()): Date {
  const due = new Date(from.getFullYear(), from.getMonth(), day);
  if (due.getTime() < new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()) {
    due.setMonth(due.getMonth() + 1);
  }
  return due;
}

/** Bills due in the next `days` days, soonest first. */
export function upcomingPayments(bills: RecurringBillInput[], days = 30, now = new Date()): UpcomingPayment[] {
  const horizon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days).getTime();
  return bills
    .map((bill) => ({
      id: bill.id,
      payee: bill.payee,
      category: bill.category,
      amount: bill.amount,
      dueDate: nextDueDate(bill.dayOfMonth, now).toISOString(),
      autopay: bill.autopay,
    }))
    .filter((bill) => new Date(bill.dueDate).getTime() <= horizon)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/** Weekly money in and out, oldest week first. Weeks start on Monday. */
export function cashFlow(transactions: Transaction[], weeks: number, now = new Date()): CashFlowWeek[] {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const result: CashFlowWeek[] = [];
  for (let index = weeks - 1; index >= 0; index--) {
    const start = new Date(monday);
    start.setDate(monday.getDate() - index * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    let moneyIn = 0;
    let moneyOut = 0;
    for (const tx of transactions) {
      if (!countsTowardFlow(tx) || time(tx) < start.getTime() || time(tx) >= end.getTime()) continue;
      if (tx.direction === "credit") moneyIn += tx.amount;
      else moneyOut += tx.amount + tx.fee;
    }
    result.push({ weekStart: start.toISOString(), moneyIn, moneyOut });
  }
  return result;
}

/** Running net (money in minus money out) for each day of the current month so far. */
export function netTrend(transactions: Transaction[], now = new Date()): TrendPoint[] {
  const points: TrendPoint[] = [];
  let running = 0;
  for (let day = 1; day <= now.getDate(); day++) {
    const start = new Date(now.getFullYear(), now.getMonth(), day).getTime();
    const end = new Date(now.getFullYear(), now.getMonth(), day + 1).getTime();
    for (const tx of transactions) {
      if (!countsTowardFlow(tx) || time(tx) < start || time(tx) >= end) continue;
      running += tx.direction === "credit" ? tx.amount : -(tx.amount + tx.fee);
    }
    points.push({ date: new Date(end - 1).toISOString(), value: running });
  }
  return points;
}

/**
 * End-of-day balances for the last `days` days, worked backwards from the current balance
 * so the last point always equals the balance shown on the account.
 */
export function balanceHistory(
  accounts: Account[],
  transactions: Transaction[],
  days: number,
  now = new Date(),
): BalanceHistory {
  const endOfDay = (offset: number) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset + 1).getTime();

  const historyFor = (account: Account | undefined): TrendPoint[] => {
    if (!account) return [];
    const own = transactions.filter((tx) => tx.accountId === account.id);
    const points: TrendPoint[] = [];
    for (let offset = days - 1; offset >= 0; offset--) {
      const cutoff = endOfDay(offset);
      const later = own.filter((tx) => time(tx) >= cutoff).reduce((sum, tx) => sum + balanceEffect(tx), 0);
      points.push({ date: new Date(cutoff - 1).toISOString(), value: account.balance - later });
    }
    return points;
  };

  return {
    checking: historyFor(accounts.find((account) => account.type === "checking")),
    savings: historyFor(accounts.find((account) => account.type === "savings")),
  };
}
