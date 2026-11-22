/**
 * Fernway Invest money rules, shared by the server and the UI so both quote the same numbers.
 * Fees and limits reuse the crypto trade rules in `lib/trades.ts`.
 */
import type { CryptoSymbol, MinorUnits } from "@/types/banking";
import type { InvestRisk, PortfolioAllocation } from "@/types/invest";
import { formatMoney } from "./money";
import { CRYPTO_NAMES, CRYPTO_SYMBOLS, MAX_TRADE, MIN_TRADE, tradeFee } from "./trades";

export { CRYPTO_NAMES, CRYPTO_SYMBOLS, MAX_TRADE, MIN_TRADE, tradeFee };

export const WEIGHT_TOTAL = 10_000;
export const MIN_WITHDRAWAL: MinorUnits = 2_000;
export const MAX_WITHDRAWAL: MinorUnits = MAX_TRADE;

export const RISK_LABELS: Record<InvestRisk, string> = {
  conservative: "Conservative",
  balanced: "Balanced",
  growth: "Growth",
  aggressive: "Aggressive",
};

export const RISKS = Object.keys(RISK_LABELS) as InvestRisk[];

/**
 * How each coin is deposited through CryptAPI and paid out by the admin. One network per coin,
 * so a customer can't send on the wrong chain by picking the wrong option.
 */
export const COIN_NETWORKS: Record<CryptoSymbol, { ticker: string; network: string; addressKind: "btc" | "evm" | "solana" }> = {
  BTC: { ticker: "btc", network: "Bitcoin network", addressKind: "btc" },
  ETH: { ticker: "eth", network: "Ethereum network", addressKind: "evm" },
  SOL: { ticker: "sol/sol", network: "Solana network", addressKind: "solana" },
  USDC: { ticker: "bep20/usdc", network: "BNB Smart Chain (BEP-20)", addressKind: "evm" },
};

const ADDRESS_PATTERNS: Record<"btc" | "evm" | "solana", RegExp> = {
  // Legacy (1…), P2SH (3…) and bech32/bech32m (bc1…).
  btc: /^(?:[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[02-9ac-hj-np-z]{11,71})$/,
  evm: /^0x[0-9a-fA-F]{40}$/,
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
};

/** Format check only (not a checksum): catches pasting the wrong kind of address. */
export function isValidAddress(symbol: CryptoSymbol, address: string): boolean {
  return ADDRESS_PATTERNS[COIN_NETWORKS[symbol].addressKind].test(address.trim());
}

export function addressHint(symbol: CryptoSymbol): string {
  switch (COIN_NETWORKS[symbol].addressKind) {
    case "btc":
      return "A Bitcoin address starting with 1, 3 or bc1.";
    case "evm":
      return "An EVM / BEP-20 address starting with 0x.";
    case "solana":
      return "A Solana address.";
  }
}

/** True when the weights are whole basis points, each above zero, with no repeats, summing to 100%. */
export function isValidMix(allocations: PortfolioAllocation[]): boolean {
  if (allocations.length === 0) return false;
  const symbols = new Set(allocations.map((allocation) => allocation.symbol));
  if (symbols.size !== allocations.length) return false;
  if (allocations.some((allocation) => !Number.isInteger(allocation.weightBps) || allocation.weightBps <= 0)) return false;
  return allocations.reduce((sum, allocation) => sum + allocation.weightBps, 0) === WEIGHT_TOTAL;
}

/**
 * Splits `amount` cents across the mix by weight. Rounding leftovers go to the largest weight,
 * so the legs always add up to exactly `amount`.
 */
export function splitByWeights(amount: MinorUnits, allocations: PortfolioAllocation[]): { symbol: CryptoSymbol; amount: MinorUnits }[] {
  const legs = allocations.map((allocation) => ({
    symbol: allocation.symbol,
    amount: Math.floor((amount * allocation.weightBps) / WEIGHT_TOTAL),
  }));
  const leftover = amount - legs.reduce((sum, leg) => sum + leg.amount, 0);
  if (legs.length > 0 && leftover !== 0) {
    let largest = 0;
    allocations.forEach((allocation, index) => {
      if (allocation.weightBps > allocations[largest].weightBps) largest = index;
    });
    legs[largest].amount += leftover;
  }
  return legs;
}

/** 24-hour change of a mix, from each coin's 24-hour change. */
export function mixChange24h(allocations: PortfolioAllocation[], change: Record<CryptoSymbol, number>): number {
  return allocations.reduce((sum, allocation) => sum + (allocation.weightBps / WEIGHT_TOTAL) * change[allocation.symbol], 0);
}

/* ---------- Quotes (used by the server; the UI shows the quote the server returns) ---------- */

export interface QuoteLeg {
  symbol: CryptoSymbol;
  /** Cents of coins bought or sold in this leg, fee excluded. */
  amount: MinorUnits;
  /** USD cents per coin. */
  price: MinorUnits;
  quantity: number;
}

export interface InvestQuoteResult {
  side: "buy" | "sell";
  /** Buy: what leaves cash. Sell: value of the coins given up. */
  amount: MinorUnits;
  fee: MinorUnits;
  /** Buy: cents of coins bought. Sell: cents that arrive in cash. */
  net: MinorUnits;
  legs: QuoteLeg[];
}

export class QuoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuoteError";
  }
}

/** Coins below this are rounding dust, treated as zero. */
export const DUST = 1e-10;

/**
 * Buying `amount` cents of a mix: the fee comes off first, the rest is split by weight and
 * each leg buys coins at its live price.
 */
export function quotePortfolioBuy(
  amount: MinorUnits,
  allocations: PortfolioAllocation[],
  prices: Record<CryptoSymbol, MinorUnits>,
): InvestQuoteResult {
  const fee = tradeFee(amount);
  const net = amount - fee;
  if (net <= 0) throw new QuoteError("That amount is too small.");
  const legs = splitByWeights(net, allocations)
    .filter((leg) => leg.amount > 0)
    .map((leg) => ({ ...leg, price: prices[leg.symbol], quantity: leg.amount / prices[leg.symbol] }));
  return { side: "buy", amount, fee, net, legs };
}

/**
 * Selling `amount` cents' worth of what is held in a portfolio (or everything when `amount` is
 * "all"): every coin is sold in the same proportion, so the mix held stays the same.
 */
export function quotePortfolioSell(
  amount: MinorUnits | "all",
  holdings: Map<CryptoSymbol, number>,
  prices: Record<CryptoSymbol, MinorUnits>,
): InvestQuoteResult {
  const held = [...holdings.entries()].filter(([, quantity]) => quantity > DUST);
  const value = held.reduce((sum, [symbol, quantity]) => sum + Math.floor(quantity * prices[symbol]), 0);
  if (value <= 0) throw new QuoteError("Nothing is held in this portfolio.");
  if (amount !== "all" && amount > value) throw new QuoteError(`You hold ${formatMoney(value, "USD")} in this portfolio.`);
  const share = amount === "all" ? 1 : amount / value;
  const legs = held.map(([symbol, quantity]) => {
    const sold = share === 1 ? quantity : quantity * share;
    return { symbol, price: prices[symbol], quantity: sold, amount: Math.floor(sold * prices[symbol]) };
  });
  const gross = legs.reduce((sum, leg) => sum + leg.amount, 0);
  const fee = tradeFee(gross);
  const net = gross - fee;
  if (net <= 0) throw new QuoteError("That amount is too small to cover the fee.");
  return { side: "sell", amount: gross, fee, net, legs: legs.filter((leg) => leg.quantity > DUST) };
}

/** A direct coin buy or sell of `amount` cents (sell: `amount` worth of coins given up). */
export function quoteDirect(
  side: "buy" | "sell",
  symbol: CryptoSymbol,
  amount: MinorUnits,
  price: MinorUnits,
  held: number,
): InvestQuoteResult {
  const fee = tradeFee(amount);
  const net = amount - fee;
  if (net <= 0) throw new QuoteError("That amount is too small.");
  if (side === "buy") {
    return { side, amount, fee, net, legs: [{ symbol, amount: net, price, quantity: net / price }] };
  }
  const quantity = amount / price;
  if (quantity > held + 1e-9) {
    throw new QuoteError(`You hold ${formatMoney(Math.floor(held * price), "USD")} of ${CRYPTO_NAMES[symbol]}.`);
  }
  return { side, amount, fee, net, legs: [{ symbol, amount, price, quantity: Math.min(quantity, held) }] };
}
