import "server-only";
import { and, eq, isNull, sql } from "drizzle-orm";
import { formatMoney } from "@/lib/money";
import type { Database } from "@/server/db/client";
import { investCashEntries, investTrades } from "@/server/db/schema";
import { HttpError } from "@/server/http";
import type { CryptoSymbol } from "@/types/banking";
import type { Tx } from "./ledger";

/**
 * Investing cash is the sum of `invest_cash_entries`:
 * completed credits count; debits count unless failed (a requested withdrawal is held at once).
 * So "cash" is always what the customer can spend or withdraw now.
 */
export const cashSql = sql<string>`coalesce(sum(case
  when ${investCashEntries.status} = 'failed' then 0
  when ${investCashEntries.direction} = 'credit' and ${investCashEntries.status} = 'completed' then ${investCashEntries.amount}
  when ${investCashEntries.direction} = 'credit' then 0
  else -(${investCashEntries.amount} + ${investCashEntries.fee}) end), 0)`;

/** Serialises every money write for one Invest customer (cash and coins together). */
export async function lockInvestor(tx: Tx, userId: string): Promise<void> {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`invest:${userId}`}))`);
}

export async function cashOf(tx: Tx | Database, userId: string): Promise<number> {
  const [row] = await tx.select({ cash: cashSql }).from(investCashEntries).where(eq(investCashEntries.userId, userId));
  return Number(row.cash);
}

/** Investing cash never goes below $0. Checked after the write, inside the same transaction, so it rolls back. */
export async function assertCash(tx: Tx, userId: string, debited: number, field = "amount"): Promise<void> {
  const cash = await cashOf(tx, userId);
  if (cash < 0) {
    throw new HttpError(422, "Not enough investing cash.", {
      [field]: `You have ${formatMoney(cash + debited, "USD")} of investing cash.`,
    });
  }
}

/** Coins held per symbol, inside one portfolio (`portfolioId`) or bought directly (`null`). */
export async function holdingsIn(tx: Tx | Database, userId: string, portfolioId: string | null): Promise<Map<CryptoSymbol, number>> {
  const rows = await tx
    .select({
      symbol: investTrades.symbol,
      quantity: sql<string>`sum(case when ${investTrades.side} = 'buy' then ${investTrades.quantity} else -${investTrades.quantity} end)`,
    })
    .from(investTrades)
    .where(
      and(
        eq(investTrades.userId, userId),
        portfolioId === null ? isNull(investTrades.portfolioId) : eq(investTrades.portfolioId, portfolioId),
      ),
    )
    .groupBy(investTrades.symbol);
  return new Map(rows.map((row) => [row.symbol, Math.max(0, Number(row.quantity))]));
}
