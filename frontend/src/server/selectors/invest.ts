import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { COIN_NETWORKS, CRYPTO_NAMES, CRYPTO_SYMBOLS, mixChange24h } from "@/lib/invest";
import { positionsFromTrades, quantityAt, type TradeRecord } from "@/lib/trades";
import { db } from "@/server/db/client";
import {
  type InvestCashEntryRow,
  investCashEntries,
  investDepositAddresses,
  type InvestDepositPaymentRow,
  investDepositPayments,
  investPortfolioAllocations,
  type InvestPortfolioRow,
  investPortfolios,
  type InvestTradeRow,
  investTrades,
  type InvestUserRow,
  investUsers,
  type InvestWithdrawalRow,
  investWithdrawals,
} from "@/server/db/schema";
import { publicBaseUrl, tickerInfo } from "@/server/services/cryptapi";
import { cashSql } from "@/server/services/invest-ledger";
import { companyAddress, investSettingsRow } from "@/server/services/invest";
import { getHistory, getLiveSpotPrices, getSpotPrices, isLive, priceNear, RANGE_DAYS, type Spot } from "@/server/services/prices";
import type { CryptoSymbol, PriceRange, TrendPoint } from "@/types/banking";
import type {
  AdminDepositPayment,
  AdminInvestCustomer,
  AdminInvestCustomerDetail,
  AdminInvestStats,
  AdminPortfolio,
  AdminWithdrawal,
  DepositPayment,
  HoldingLine,
  InvestDeposits,
  InvestMarketPrice,
  InvestOverview,
  InvestSettings,
  InvestTransaction,
  InvestUser,
  Portfolio,
  PortfolioAllocation,
  Withdrawal,
  WithdrawalStatus,
} from "@/types/invest";

/* ---------- Mappers ---------- */

export function toInvestUser(row: InvestUserRow): InvestUser {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    createdAt: row.createdAt.toISOString(),
  };
}

type SpotMap = Record<CryptoSymbol, Spot>;

function toPortfolio(row: InvestPortfolioRow, allocations: PortfolioAllocation[], spot: SpotMap): Portfolio {
  const change = Object.fromEntries(CRYPTO_SYMBOLS.map((symbol) => [symbol, spot[symbol].change24h])) as Record<CryptoSymbol, number>;
  return {
    id: row.id,
    name: row.name,
    summary: row.summary,
    description: row.description,
    imageUrl: row.imageUrl,
    risk: row.risk,
    autoDailyEnabled: row.autoDailyEnabled,
    dailyRateBps: row.dailyRateBps,
    dailyFixedCents: row.dailyFixedCents,
    allocations,
    change24h: mixChange24h(allocations, change),
  };
}

function toWithdrawal(row: InvestWithdrawalRow): Withdrawal {
  return {
    id: row.id,
    symbol: row.symbol,
    network: row.network,
    address: row.address,
    amount: row.amount,
    status: row.status,
    payoutTxid: row.payoutTxid,
    rejectReason: row.rejectReason,
    requestedAt: row.createdAt.toISOString(),
    decidedAt: row.decidedAt?.toISOString() ?? null,
  };
}

function toDepositPayment(row: InvestDepositPaymentRow): DepositPayment {
  return {
    id: row.id,
    symbol: row.symbol,
    quantity: Number(row.valueCoin),
    feeQuantity: Number(row.feeCoin),
    txid: row.txidIn,
    status: row.status,
    credited: row.credited,
    price: row.price,
    receivedAt: row.receivedAt.toISOString(),
    creditedAt: row.creditedAt?.toISOString() ?? null,
  };
}

function toTransaction(entry: InvestCashEntryRow, trades: InvestTradeRow[], portfolioName: string | null): InvestTransaction {
  return {
    id: entry.id,
    kind: entry.kind,
    direction: entry.direction,
    status: entry.status,
    amount: entry.amount,
    fee: entry.fee,
    description: entry.description,
    reference: entry.reference,
    portfolioName,
    trades: trades.map((trade) => ({
      symbol: trade.symbol,
      side: trade.side,
      quantity: Number(trade.quantity),
      price: trade.price,
      amount: trade.amount,
    })),
    occurredAt: entry.occurredAt.toISOString(),
  };
}

/* ---------- Shared reads ---------- */

async function allocationsFor(portfolioIds: string[]): Promise<Map<string, PortfolioAllocation[]>> {
  const map = new Map<string, PortfolioAllocation[]>();
  if (portfolioIds.length === 0) return map;
  const rows = await db()
    .select()
    .from(investPortfolioAllocations)
    .where(inArray(investPortfolioAllocations.portfolioId, portfolioIds))
    .orderBy(desc(investPortfolioAllocations.weightBps));
  for (const row of rows) {
    const list = map.get(row.portfolioId) ?? [];
    list.push({ symbol: row.symbol, weightBps: row.weightBps });
    map.set(row.portfolioId, list);
  }
  return map;
}

async function tradesOf(userId: string): Promise<InvestTradeRow[]> {
  return db().select().from(investTrades).where(eq(investTrades.userId, userId)).orderBy(asc(investTrades.occurredAt));
}

function toRecord(trade: InvestTradeRow): TradeRecord {
  return { symbol: trade.symbol, side: trade.side, quantity: Number(trade.quantity), amount: trade.amount, fee: 0, occurredAt: trade.occurredAt };
}

function holdingLines(trades: InvestTradeRow[], spot: SpotMap): HoldingLine[] {
  const positions = positionsFromTrades(trades.map(toRecord));
  return CRYPTO_SYMBOLS.filter((symbol) => positions[symbol].quantity > 0).map((symbol) => {
    const { quantity, averageCost } = positions[symbol];
    const price = spot[symbol].price;
    return {
      symbol,
      name: CRYPTO_NAMES[symbol],
      quantity,
      price,
      value: Math.floor(quantity * price),
      cost: Math.round(quantity * averageCost),
    };
  });
}

async function cashFor(userId: string): Promise<number> {
  const [row] = await db().select({ cash: cashSql }).from(investCashEntries).where(eq(investCashEntries.userId, userId));
  return Number(row.cash);
}

/* ---------- Customer reads ---------- */

/**
 * Idempotently credits daily earnings for any offering with `autoDailyEnabled = true`
 * that the customer actively holds, using a deterministic per-day reference.
 */
async function syncAutoDailyEarnings(userId: string, trades: InvestTradeRow[]): Promise<void> {
  const byPortfolio = new Map<string, InvestTradeRow[]>();
  for (const trade of trades) {
    if (trade.portfolioId) {
      byPortfolio.set(trade.portfolioId, [...(byPortfolio.get(trade.portfolioId) ?? []), trade]);
    }
  }
  const ids = [...byPortfolio.keys()];
  if (ids.length === 0) return;

  const portfolios = await db().select().from(investPortfolios).where(inArray(investPortfolios.id, ids));
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  for (const portfolio of portfolios) {
    if (!portfolio.autoDailyEnabled) continue;
    if (portfolio.dailyFixedCents <= 0 && portfolio.dailyRateBps <= 0) continue;

    const portfolioTrades = byPortfolio.get(portfolio.id) ?? [];
    const positions = positionsFromTrades(portfolioTrades.map(toRecord));
    const heldCost = CRYPTO_SYMBOLS.reduce((sum, s) => sum + Math.round(positions[s].quantity * positions[s].averageCost), 0);
    const hasPosition = CRYPTO_SYMBOLS.some((s) => positions[s].quantity > 0);
    if (!hasPosition) continue;

    const firstBuy = portfolioTrades.find((t) => t.side === "buy")?.occurredAt ?? portfolio.createdAt;
    const startMs = Math.max(firstBuy.getTime(), today.getTime() - 30 * 86_400_000);
    const startDate = new Date(startMs);
    const cursor = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));

    const dailyCents = portfolio.dailyFixedCents + Math.round((heldCost * portfolio.dailyRateBps) / 10_000);
    if (dailyCents <= 0) continue;

    const rows: Array<{
      userId: string;
      kind: "earning";
      direction: "credit";
      status: "completed";
      amount: number;
      fee: number;
      description: string;
      reference: string;
      portfolioId: string;
      occurredAt: Date;
    }> = [];

    while (cursor.toISOString().slice(0, 10) <= todayKey) {
      const dateStr = cursor.toISOString().slice(0, 10);
      rows.push({
        userId,
        kind: "earning",
        direction: "credit",
        status: "completed",
        amount: dailyCents,
        fee: 0,
        description: `Auto daily earning · ${portfolio.name}`,
        reference: `auto-daily:${userId}:${portfolio.id}:${dateStr}`,
        portfolioId: portfolio.id,
        occurredAt: new Date(`${dateStr}T12:00:00.000Z`),
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    if (rows.length > 0) {
      await db().insert(investCashEntries).values(rows).onConflictDoNothing({ target: investCashEntries.reference });
    }
  }
}

export async function overviewFor(userId: string): Promise<InvestOverview> {
  const trades = await tradesOf(userId);
  await syncAutoDailyEarnings(userId, trades);
  const [spot, cash] = await Promise.all([getSpotPrices(), cashFor(userId)]);

  const byPortfolio = new Map<string, InvestTradeRow[]>();
  const direct: InvestTradeRow[] = [];
  for (const trade of trades) {
    if (!trade.portfolioId) direct.push(trade);
    else byPortfolio.set(trade.portfolioId, [...(byPortfolio.get(trade.portfolioId) ?? []), trade]);
  }

  const ids = [...byPortfolio.keys()];
  const [portfolioRows, allocations] = await Promise.all([
    ids.length ? db().select().from(investPortfolios).where(inArray(investPortfolios.id, ids)) : Promise.resolve([]),
    allocationsFor(ids),
  ]);

  const portfolios = portfolioRows
    .map((row) => {
      const holdings = holdingLines(byPortfolio.get(row.id) ?? [], spot);
      return {
        portfolio: toPortfolio(row, allocations.get(row.id) ?? [], spot),
        value: holdings.reduce((sum, line) => sum + line.value, 0),
        cost: holdings.reduce((sum, line) => sum + line.cost, 0),
        holdings,
      };
    })
    .filter((position) => position.holdings.length > 0)
    .sort((a, b) => b.value - a.value);
  const directLines = holdingLines(direct, spot);

  const invested = portfolios.reduce((sum, p) => sum + p.value, 0) + directLines.reduce((sum, line) => sum + line.value, 0);
  const cost = portfolios.reduce((sum, p) => sum + p.cost, 0) + directLines.reduce((sum, line) => sum + line.cost, 0);
  return { cash, invested, cost, total: cash + invested, portfolios, direct: directLines, pricesLive: isLive(spot) };
}

/** Value of everything held over the range: coins held at each moment times that moment's real price. */
export async function historyFor(userId: string, range: PriceRange): Promise<TrendPoint[]> {
  const trades = (await tradesOf(userId)).map(toRecord);
  const symbols = CRYPTO_SYMBOLS.filter((symbol) => trades.some((trade) => trade.symbol === symbol));
  if (symbols.length === 0) return [];

  const days = RANGE_DAYS[range];
  const [spot, ...series] = await Promise.all([getSpotPrices(), ...symbols.map((symbol) => getHistory(symbol, days))]);
  const axis = series[0].map((point) => new Date(point.time).getTime());
  const value = (time: number, price: (symbol: CryptoSymbol, index: number) => number) =>
    symbols.reduce((sum, symbol, index) => sum + Math.round(quantityAt(trades, symbol, time) * price(symbol, index)), 0);

  const points = axis.map((time) => ({
    date: new Date(time).toISOString(),
    value: value(time, (_symbol, index) => priceNear(series[index], time)),
  }));
  const now = Date.now();
  points.push({ date: new Date(now).toISOString(), value: value(now, (symbol) => spot[symbol].price) });
  return points;
}

export async function marketPrices(): Promise<InvestMarketPrice[]> {
  const spot = await getSpotPrices();
  return CRYPTO_SYMBOLS.map((symbol) => ({ symbol, name: CRYPTO_NAMES[symbol], price: spot[symbol].price, change24h: spot[symbol].change24h }));
}

export async function publishedPortfolios(): Promise<Portfolio[]> {
  const [spot, rows] = await Promise.all([
    getSpotPrices(),
    db().select().from(investPortfolios).where(eq(investPortfolios.published, true)).orderBy(asc(investPortfolios.createdAt)),
  ]);
  const allocations = await allocationsFor(rows.map((row) => row.id));
  return rows.map((row) => toPortfolio(row, allocations.get(row.id) ?? [], spot));
}

/** A published portfolio, or one the customer still holds coins in (so they can take money out). */
export async function portfolioForCustomer(userId: string, id: string): Promise<Portfolio | null> {
  const [row] = await db().select().from(investPortfolios).where(eq(investPortfolios.id, id)).limit(1);
  if (!row) return null;
  if (!row.published) {
    const [held] = await db()
      .select({ count: sql<number>`count(*)::int` })
      .from(investTrades)
      .where(and(eq(investTrades.userId, userId), eq(investTrades.portfolioId, id)));
    if (held.count === 0) return null;
  }
  const [spot, allocations] = await Promise.all([getSpotPrices(), allocationsFor([id])]);
  return toPortfolio(row, allocations.get(id) ?? [], spot);
}

export async function transactionsFor(userId: string, limit = 200): Promise<InvestTransaction[]> {
  const entries = await db()
    .select({ entry: investCashEntries, portfolioName: investPortfolios.name })
    .from(investCashEntries)
    .leftJoin(investPortfolios, eq(investPortfolios.id, investCashEntries.portfolioId))
    .where(eq(investCashEntries.userId, userId))
    .orderBy(desc(investCashEntries.occurredAt))
    .limit(limit);
  return withTrades(entries);
}

async function withTrades(entries: { entry: InvestCashEntryRow; portfolioName: string | null }[]): Promise<InvestTransaction[]> {
  const ids = entries.map(({ entry }) => entry.id);
  const trades = ids.length ? await db().select().from(investTrades).where(inArray(investTrades.entryId, ids)) : [];
  const byEntry = new Map<string, InvestTradeRow[]>();
  for (const trade of trades) byEntry.set(trade.entryId, [...(byEntry.get(trade.entryId) ?? []), trade]);
  return entries.map(({ entry, portfolioName }) => toTransaction(entry, byEntry.get(entry.id) ?? [], portfolioName));
}

export async function transactionById(userId: string, id: string): Promise<InvestTransaction> {
  const rows = await db()
    .select({ entry: investCashEntries, portfolioName: investPortfolios.name })
    .from(investCashEntries)
    .leftJoin(investPortfolios, eq(investPortfolios.id, investCashEntries.portfolioId))
    .where(and(eq(investCashEntries.id, id), eq(investCashEntries.userId, userId)))
    .limit(1);
  const [transaction] = await withTrades(rows);
  return transaction;
}

async function paymentsOf(userId: string): Promise<InvestDepositPaymentRow[]> {
  return db()
    .select()
    .from(investDepositPayments)
    .where(eq(investDepositPayments.userId, userId))
    .orderBy(desc(investDepositPayments.receivedAt));
}

export async function depositsFor(userId: string): Promise<InvestDeposits> {
  const [settings, addresses, payments] = await Promise.all([
    investSettingsRow(),
    db().select().from(investDepositAddresses).where(eq(investDepositAddresses.userId, userId)),
    paymentsOf(userId),
  ]);
  const open = settings.depositsOpen && publicBaseUrl() !== null;
  const available = CRYPTO_SYMBOLS.filter((symbol) => companyAddress(settings, symbol) !== "" || addresses.some((a) => a.symbol === symbol));
  // Gateway details are only needed (and only fetched) while deposits are open.
  const infos = open ? await Promise.all(available.map((symbol) => tickerInfo(symbol).catch(() => null))) : [];
  const coins = open
    ? available.flatMap((symbol, index) => {
        const info = infos[index];
        if (!info) return [];
        return [
          {
            symbol,
            name: CRYPTO_NAMES[symbol],
            network: COIN_NETWORKS[symbol].network,
            minimum: info.minimum,
            feeRate: info.feeRate,
            address: addresses.find((address) => address.symbol === symbol)?.addressIn ?? null,
          },
        ];
      })
    : [];
  return { open, coins, payments: payments.map(toDepositPayment) };
}

export async function withdrawalsFor(userId: string): Promise<Withdrawal[]> {
  const rows = await db().select().from(investWithdrawals).where(eq(investWithdrawals.userId, userId)).orderBy(desc(investWithdrawals.createdAt));
  return rows.map(toWithdrawal);
}

export async function withdrawalById(id: string): Promise<Withdrawal> {
  const [row] = await db().select().from(investWithdrawals).where(eq(investWithdrawals.id, id)).limit(1);
  return toWithdrawal(row);
}

/* ---------- Admin reads ---------- */

/** Coins held now per customer and portfolio (null = direct), across everyone. */
async function allHoldings() {
  const rows = await db()
    .select({
      userId: investTrades.userId,
      portfolioId: investTrades.portfolioId,
      symbol: investTrades.symbol,
      quantity: sql<string>`sum(case when ${investTrades.side} = 'buy' then ${investTrades.quantity} else -${investTrades.quantity} end)`,
    })
    .from(investTrades)
    .groupBy(investTrades.userId, investTrades.portfolioId, investTrades.symbol);
  return rows.map((row) => ({ ...row, quantity: Math.max(0, Number(row.quantity)) })).filter((row) => row.quantity > 1e-10);
}

async function cashByCustomer(): Promise<Map<string, number>> {
  const rows = await db().select({ userId: investCashEntries.userId, cash: cashSql }).from(investCashEntries).groupBy(investCashEntries.userId);
  return new Map(rows.map((row) => [row.userId, Number(row.cash)]));
}

function toAdminCustomer(row: InvestUserRow, cash: number, invested: number): AdminInvestCustomer {
  return { ...toInvestUser(row), disabled: row.disabledAt !== null, cash, invested };
}

export async function adminCustomers(): Promise<AdminInvestCustomer[]> {
  const [rows, cash, holdings, spot] = await Promise.all([
    db().select().from(investUsers).orderBy(desc(investUsers.createdAt)),
    cashByCustomer(),
    allHoldings(),
    getSpotPrices(),
  ]);
  const invested = new Map<string, number>();
  for (const holding of holdings) {
    invested.set(holding.userId, (invested.get(holding.userId) ?? 0) + Math.floor(holding.quantity * spot[holding.symbol].price));
  }
  return rows.map((row) => toAdminCustomer(row, cash.get(row.id) ?? 0, invested.get(row.id) ?? 0));
}

export async function adminCustomer(id: string): Promise<AdminInvestCustomer | null> {
  const [row] = await db().select().from(investUsers).where(eq(investUsers.id, id)).limit(1);
  if (!row) return null;
  const overview = await overviewFor(id);
  return toAdminCustomer(row, overview.cash, overview.invested);
}

export async function adminCustomerDetail(id: string): Promise<AdminInvestCustomerDetail | null> {
  const [row] = await db().select().from(investUsers).where(eq(investUsers.id, id)).limit(1);
  if (!row) return null;
  const [overview, transactions, payments, withdrawals] = await Promise.all([
    overviewFor(id),
    transactionsFor(id, 500),
    paymentsOf(id),
    withdrawalsFor(id),
  ]);
  return {
    customer: toAdminCustomer(row, overview.cash, overview.invested),
    overview,
    transactions,
    deposits: payments.map(toDepositPayment),
    withdrawals,
  };
}

export async function adminPortfolios(): Promise<AdminPortfolio[]> {
  const [rows, holdings, spot] = await Promise.all([
    db().select().from(investPortfolios).orderBy(asc(investPortfolios.createdAt)),
    allHoldings(),
    getSpotPrices(),
  ]);
  const allocations = await allocationsFor(rows.map((row) => row.id));
  return rows.map((row) => {
    const inIt = holdings.filter((holding) => holding.portfolioId === row.id);
    return {
      ...toPortfolio(row, allocations.get(row.id) ?? [], spot),
      published: row.published,
      investors: new Set(inIt.map((holding) => holding.userId)).size,
      value: inIt.reduce((sum, holding) => sum + Math.floor(holding.quantity * spot[holding.symbol].price), 0),
      createdAt: row.createdAt.toISOString(),
    };
  });
}

export async function adminPortfolio(id: string): Promise<AdminPortfolio | null> {
  return (await adminPortfolios()).find((portfolio) => portfolio.id === id) ?? null;
}

function customerRef(row: InvestUserRow) {
  return { id: row.id, name: `${row.firstName} ${row.lastName}`, email: row.email };
}

export async function adminWithdrawals(status?: WithdrawalStatus): Promise<AdminWithdrawal[]> {
  const rows = await db()
    .select({ withdrawal: investWithdrawals, customer: investUsers })
    .from(investWithdrawals)
    .innerJoin(investUsers, eq(investUsers.id, investWithdrawals.userId))
    .where(status ? eq(investWithdrawals.status, status) : undefined)
    .orderBy(status === "requested" ? asc(investWithdrawals.createdAt) : desc(investWithdrawals.createdAt))
    .limit(500);
  const spot = await getLiveSpotPrices().catch(() => null);
  return rows.map(({ withdrawal, customer }) => ({
    ...toWithdrawal(withdrawal),
    customer: customerRef(customer),
    estimatedQuantity: spot ? withdrawal.amount / spot[withdrawal.symbol].price : null,
  }));
}

export async function adminWithdrawal(id: string): Promise<AdminWithdrawal | null> {
  const [row] = await db()
    .select({ withdrawal: investWithdrawals, customer: investUsers })
    .from(investWithdrawals)
    .innerJoin(investUsers, eq(investUsers.id, investWithdrawals.userId))
    .where(eq(investWithdrawals.id, id))
    .limit(1);
  if (!row) return null;
  const spot = await getLiveSpotPrices().catch(() => null);
  return {
    ...toWithdrawal(row.withdrawal),
    customer: customerRef(row.customer),
    estimatedQuantity: spot ? row.withdrawal.amount / spot[row.withdrawal.symbol].price : null,
  };
}

export async function adminDeposits(): Promise<AdminDepositPayment[]> {
  const rows = await db()
    .select({ payment: investDepositPayments, customer: investUsers })
    .from(investDepositPayments)
    .innerJoin(investUsers, eq(investUsers.id, investDepositPayments.userId))
    .orderBy(desc(investDepositPayments.receivedAt))
    .limit(500);
  return rows.map(({ payment, customer }) => ({ ...toDepositPayment(payment), customer: customerRef(customer) }));
}

export async function adminSettings(): Promise<InvestSettings> {
  const settings = await investSettingsRow();
  return {
    depositsOpen: settings.depositsOpen,
    addresses: { BTC: settings.btcAddress, ETH: settings.ethAddress, SOL: settings.solAddress, USDC: settings.usdcAddress },
    callbackBaseUrl: publicBaseUrl(),
  };
}

export async function adminStats(): Promise<AdminInvestStats> {
  const [[customers], cash, holdings, spot, [pending]] = await Promise.all([
    db().select({ count: sql<number>`count(*)::int` }).from(investUsers),
    cashByCustomer(),
    allHoldings(),
    getSpotPrices(),
    db()
      .select({ count: sql<number>`count(*)::int`, amount: sql<string>`coalesce(sum(${investWithdrawals.amount}), 0)` })
      .from(investWithdrawals)
      .where(eq(investWithdrawals.status, "requested")),
  ]);
  return {
    customers: customers.count,
    cash: [...cash.values()].reduce((sum, value) => sum + value, 0),
    invested: holdings.reduce((sum, holding) => sum + Math.floor(holding.quantity * spot[holding.symbol].price), 0),
    pendingWithdrawals: pending.count,
    pendingWithdrawalAmount: Number(pending.amount),
  };
}
