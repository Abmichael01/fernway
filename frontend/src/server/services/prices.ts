import "server-only";
import { CRYPTO_SYMBOLS } from "@/lib/trades";
import type { CryptoSymbol, PricePoint, PriceRange } from "@/types/banking";

/**
 * Market prices from CoinGecko's public API. The free API allows only a few requests a minute,
 * so: requests are spaced out one at a time, each coin needs at most two price series (90 days
 * hourly, 1 year daily) from which every chart range is cut, and everything is cached in memory.
 * If the API can't be reached, the last good answer is reused; if there has never been one,
 * prices fall back to fixed reference values (charts only; trades refuse to use them).
 * All prices are USD cents per coin.
 */

const COINGECKO = "https://api.coingecko.com/api/v3";
const IDS: Record<CryptoSymbol, string> = { BTC: "bitcoin", ETH: "ethereum", SOL: "solana", USDC: "usd-coin" };
const TIMEOUT_MS = 10_000;
const SPOT_TTL_MS = 60_000;
const HISTORY_TTL_MS = 30 * 60_000;
/** Minimum gap between two requests to the price API. */
const REQUEST_SPACING_MS = 1_500;
const DAY_MS = 86_400_000;
/** Trades refuse a price older than this. */
const MAX_TRADE_PRICE_AGE_MS = 15 * 60_000;
const MAX_POINTS = 180;

/** Used only when the price API has never answered since the server started. */
const REFERENCE_PRICES: Record<CryptoSymbol, number> = { BTC: 7_370_000, ETH: 205_000, SOL: 8_300, USDC: 100 };

export const RANGE_DAYS: Record<PriceRange, number> = { "1W": 7, "1M": 30, "3M": 90, "1Y": 365 };

export interface Spot {
  price: number;
  /** Fraction, e.g. −0.0145 for −1.45%. */
  change24h: number;
}

function reference<T extends object>(value: T): T {
  referenceValues.add(value);
  return value;
}

/** True when this is real market data (fresh or the last good answer), not the offline reference. */
export function isLive(value: object): boolean {
  return !referenceValues.has(value);
}

export class PricesUnavailableError extends Error {
  constructor() {
    super("Live prices aren't available right now. Try again in a minute.");
  }
}

interface Entry<T> {
  value: T;
  /** When this entry was last refreshed or retried; drives the TTL. */
  fetchedAt: number;
  /** When real data last arrived from the API (0 = never). */
  loadedAt: number;
  pending?: Promise<T>;
}

/** Kept on globalThis so the startup warm-up (instrumentation.ts) and route handlers share one cache. */
const shared = globalThis as typeof globalThis & {
  fernwayPrices3?: {
    spot: { entry?: Entry<Record<CryptoSymbol, Spot>> };
    history: Map<string, Entry<PricePoint[]>>;
    /** Tail of the request queue: each request starts after the previous one plus a gap. */
    queue: Promise<unknown>;
    /** Reference values handed out when the API has never answered. Never used to price a trade. */
    references: WeakSet<object>;
  };
};
shared.fernwayPrices3 ??= { spot: {}, history: new Map(), queue: Promise.resolve(), references: new WeakSet() };
const priceCache = shared.fernwayPrices3;
const spotCache = priceCache.spot;
const referenceValues = priceCache.references;

class PriceApiStatusError extends Error {}

async function request<T>(path: string, attempt = 1): Promise<T> {
  try {
    const response = await fetch(`${COINGECKO}${path}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new PriceApiStatusError(`Price API answered ${response.status} for ${path}`);
    return (await response.json()) as T;
  } catch (error) {
    // One retry covers a dropped connection. A refusal (e.g. 429 "slow down") is not retried.
    if (attempt < 2 && !(error instanceof PriceApiStatusError)) return request<T>(path, attempt + 1);
    throw error;
  }
}

/** Runs requests one at a time with a gap between them, so a page load never bursts the API. */
function getJson<T>(path: string): Promise<T> {
  const run = priceCache.queue.then(() => request<T>(path));
  priceCache.queue = run.catch(() => undefined).then(() => new Promise((resolve) => setTimeout(resolve, REQUEST_SPACING_MS)));
  return run;
}

/**
 * Fresh cache is served as is. Stale real data is served at once while a refresh runs in the
 * background (so nobody waits on the request queue). With nothing real cached, callers wait for
 * the request; if it fails they get the last good value, or the reference value.
 */
function cached<T extends object>(
  entry: Entry<T> | undefined,
  ttl: number,
  load: () => Promise<T>,
  fallback: () => T,
  store: (e: Entry<T>) => void,
): Promise<T> {
  const now = Date.now();
  if (entry && now - entry.fetchedAt < ttl) return Promise.resolve(entry.value);
  if (entry?.pending) return isLive(entry.value) ? Promise.resolve(entry.value) : entry.pending;

  const pending = load()
    .then((value) => {
      store({ value, fetchedAt: Date.now(), loadedAt: Date.now() });
      return value;
    })
    .catch((error: unknown) => {
      console.warn("[prices]", error instanceof Error ? error.message : error);
      // Keep the last good value (or the reference one), and try the API again in a minute.
      const value = entry ? entry.value : fallback();
      store({ value, fetchedAt: Date.now() - ttl + 60_000, loadedAt: entry?.loadedAt ?? 0 });
      return value;
    });
  store({ value: entry?.value ?? fallback(), fetchedAt: entry?.fetchedAt ?? 0, loadedAt: entry?.loadedAt ?? 0, pending });
  return entry && isLive(entry.value) ? Promise.resolve(entry.value) : pending;
}

const toCents = (usd: number) => Math.max(1, Math.round(usd * 100));

export function getSpotPrices(): Promise<Record<CryptoSymbol, Spot>> {
  return cached(
    spotCache.entry,
    SPOT_TTL_MS,
    async () => {
      const ids = CRYPTO_SYMBOLS.map((symbol) => IDS[symbol]).join(",");
      const data = await getJson<Record<string, { usd: number; usd_24h_change?: number }>>(
        `/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      );
      return Object.fromEntries(
        CRYPTO_SYMBOLS.map((symbol) => {
          const row = data[IDS[symbol]];
          if (!row || typeof row.usd !== "number") throw new Error(`No price for ${symbol}`);
          return [symbol, { price: toCents(row.usd), change24h: (row.usd_24h_change ?? 0) / 100 }];
        }),
      ) as Record<CryptoSymbol, Spot>;
    },
    () =>
      reference(
        Object.fromEntries(CRYPTO_SYMBOLS.map((symbol) => [symbol, { price: REFERENCE_PRICES[symbol], change24h: 0 }])) as Record<
          CryptoSymbol,
          Spot
        >,
      ),
    (entry) => {
      spotCache.entry = entry;
    },
  );
}

function downsample(points: PricePoint[]): PricePoint[] {
  if (points.length <= MAX_POINTS) return points;
  const step = (points.length - 1) / (MAX_POINTS - 1);
  return Array.from({ length: MAX_POINTS }, (_, index) => points[Math.round(index * step)]);
}

/** A flat line at the reference price, used only when the API has never answered. */
function flatHistory(symbol: CryptoSymbol, days: number): PricePoint[] {
  const now = Date.now();
  const step = (days * DAY_MS) / (MAX_POINTS - 1);
  return Array.from({ length: MAX_POINTS }, (_, index) => ({
    time: new Date(now - (MAX_POINTS - 1 - index) * step).toISOString(),
    price: REFERENCE_PRICES[symbol],
  }));
}

/** The two series fetched per coin: 90 days (hourly points) and 365 days (daily points). */
type SourceDays = 90 | 365;

function sourceSeries(symbol: CryptoSymbol, days: SourceDays): Promise<PricePoint[]> {
  const key = `${symbol}:${days}`;
  return cached(
    priceCache.history.get(key),
    HISTORY_TTL_MS,
    async () => {
      const data = await getJson<{ prices: Array<[number, number]> }>(
        `/coins/${IDS[symbol]}/market_chart?vs_currency=usd&days=${days}`,
      );
      if (!Array.isArray(data.prices) || data.prices.length < 2) throw new Error(`No history for ${symbol}`);
      return data.prices.map(([time, usd]) => ({ time: new Date(time).toISOString(), price: toCents(usd) }));
    },
    () => reference(flatHistory(symbol, days)),
    (entry) => {
      priceCache.history.set(key, entry);
    },
  );
}

/** Price points covering the last `days` days, oldest first, at most MAX_POINTS of them. */
export async function getHistory(symbol: CryptoSymbol, days: number): Promise<PricePoint[]> {
  const source = await sourceSeries(symbol, days <= 90 ? 90 : 365);
  const since = Date.now() - days * DAY_MS;
  const window = downsample(source.filter((point) => new Date(point.time).getTime() >= since));
  return isLive(source) ? window : reference(window);
}

/** Today's prices, only if they are real. Trades must never run on reference prices. */
export async function getLiveSpotPrices(): Promise<Record<CryptoSymbol, Spot>> {
  const spot = await getSpotPrices();
  const loadedAt = spotCache.entry?.loadedAt ?? 0;
  if (!isLive(spot) || Date.now() - loadedAt > MAX_TRADE_PRICE_AGE_MS) throw new PricesUnavailableError();
  return spot;
}

/** The price point closest to `time` in a series sorted oldest first. */
export function priceNear(series: PricePoint[], time: number): number {
  let low = 0;
  let high = series.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (new Date(series[mid].time).getTime() < time) low = mid + 1;
    else high = mid;
  }
  const after = series[low];
  const before = series[Math.max(0, low - 1)];
  const closer =
    Math.abs(new Date(before.time).getTime() - time) <= Math.abs(new Date(after.time).getTime() - time) ? before : after;
  return closer.price;
}

/**
 * The market price at a past moment, for trades the admin records after the fact.
 * Uses the finest series that covers the date. Throws if the date is more than a year back.
 */
export async function priceAt(symbol: CryptoSymbol, when: Date): Promise<number> {
  const age = Date.now() - when.getTime();
  if (age < 60 * 60_000) return (await getLiveSpotPrices())[symbol].price;
  if (age > 365 * DAY_MS) throw new Error("Prices are only available for the last 12 months.");
  // Hourly points for the last 90 days, daily before that.
  const series = await sourceSeries(symbol, age <= 89 * DAY_MS ? 90 : 365);
  if (!isLive(series)) throw new PricesUnavailableError();
  return priceNear(series, when.getTime());
}
