import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { CRYPTO_NAMES, CRYPTO_SYMBOLS, positionsFromTrades, quantityAt, type TradeRecord } from "@/lib/trades";
import { db } from "@/server/db/client";
import { cryptoTrades, recipients } from "@/server/db/schema";
import { getHistory, getSpotPrices, priceNear, RANGE_DAYS } from "@/server/services/prices";
import type { CryptoAsset, CryptoSymbol, PriceRange, Recipient, TrendPoint } from "@/types/banking";

async function tradesOf(userId: string): Promise<TradeRecord[]> {
  try {
    const rows = await db()
      .select()
      .from(cryptoTrades)
      .where(eq(cryptoTrades.userId, userId))
      .orderBy(asc(cryptoTrades.occurredAt));
    return rows.map((row) => ({
      symbol: row.symbol,
      side: row.side,
      quantity: Number(row.quantity),
      amount: row.amount,
      fee: row.fee,
      occurredAt: row.occurredAt,
    }));
  } catch {
    return [];
  }
}

/** Every supported coin with today's price and the customer's position (zero if none). */
export async function assetsForUser(userId: string): Promise<CryptoAsset[]> {
  const [spot, trades] = await Promise.all([getSpotPrices(), tradesOf(userId)]);
  const positions = positionsFromTrades(trades);
  return CRYPTO_SYMBOLS.map((symbol) => ({
    symbol,
    name: CRYPTO_NAMES[symbol],
    price: spot[symbol].price,
    change24h: spot[symbol].change24h,
    holding: positions[symbol].quantity,
    averageCost: positions[symbol].averageCost,
  }));
}

/**
 * What the customer's coins were worth over the range: at each point, the coins they held at
 * that moment times that moment's price. The last point is now, at today's prices.
 */
export async function portfolioHistory(userId: string, range: PriceRange): Promise<TrendPoint[]> {
  const trades = await tradesOf(userId);
  const symbols = CRYPTO_SYMBOLS.filter((symbol) => trades.some((trade) => trade.symbol === symbol));
  if (symbols.length === 0) return [];

  const days = RANGE_DAYS[range];
  const [spot, ...series] = await Promise.all([getSpotPrices(), ...symbols.map((symbol) => getHistory(symbol, days))]);
  const bySymbol = new Map<CryptoSymbol, (typeof series)[number]>(symbols.map((symbol, index) => [symbol, series[index]]));
  const axis = series[0].map((point) => new Date(point.time).getTime());

  const points = axis.map((time) => ({
    date: new Date(time).toISOString(),
    value: symbols.reduce(
      (sum, symbol) => sum + Math.round(quantityAt(trades, symbol, time) * priceNear(bySymbol.get(symbol)!, time)),
      0,
    ),
  }));
  const now = Date.now();
  points.push({
    date: new Date(now).toISOString(),
    value: symbols.reduce((sum, symbol) => sum + Math.round(quantityAt(trades, symbol, now) * spot[symbol].price), 0),
  });
  return points;
}

export async function recipientsForUser(userId: string): Promise<Recipient[]> {
  try {
    const rows = await db().select().from(recipients).where(eq(recipients.userId, userId)).orderBy(desc(recipients.createdAt));
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      bankName: row.bankName,
      routingNumber: row.routingNumber,
      accountNumber: row.accountNumber,
      accountType: row.accountType,
    }));
  } catch {
    return [];
  }
}
