import type { CryptoSymbol, MinorUnits, TradeQuote, TradeSide } from "@/types/banking";

/** Fee on each trade, as a share of the USD amount, with a floor. */
export const TRADE_FEE_RATE = 0.0125;
export const MIN_TRADE_FEE: MinorUnits = 99;
export const MIN_TRADE: MinorUnits = 1_000;
export const MAX_TRADE: MinorUnits = 10_000_000;

export const CRYPTO_NAMES: Record<CryptoSymbol, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  USDC: "USD Coin",
};

export const CRYPTO_SYMBOLS = Object.keys(CRYPTO_NAMES) as CryptoSymbol[];

export function tradeFee(amount: MinorUnits): MinorUnits {
  return Math.max(MIN_TRADE_FEE, Math.round(amount * TRADE_FEE_RATE));
}

/**
 * A buy spends `amount` (fee included) and receives (amount − fee) worth of coins.
 * A sell gives up `amount` worth of coins and pays out (amount − fee).
 * `price` is USD cents per coin.
 */
export function quoteTrade(side: TradeSide, symbol: CryptoSymbol, amount: MinorUnits, price: MinorUnits): TradeQuote {
  const fee = tradeFee(amount);
  const quantity = side === "buy" ? (amount - fee) / price : amount / price;
  return { side, symbol, amount, fee, price, quantity };
}

export interface TradeRecord {
  symbol: CryptoSymbol;
  side: TradeSide;
  quantity: number;
  amount: MinorUnits;
  fee: MinorUnits;
  occurredAt: Date;
}

export interface Position {
  quantity: number;
  /** USD cents per coin paid, on average, for the coins still held. */
  averageCost: MinorUnits;
}

/** Coins below this are rounding dust, treated as zero. */
const DUST = 1e-10;

/** Current position per symbol, from trades in time order. Sells reduce the cost basis proportionally. */
export function positionsFromTrades(trades: TradeRecord[]): Record<CryptoSymbol, Position> {
  const state = Object.fromEntries(CRYPTO_SYMBOLS.map((symbol) => [symbol, { quantity: 0, cost: 0 }])) as Record<
    CryptoSymbol,
    { quantity: number; cost: number }
  >;
  const ordered = [...trades].sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  for (const trade of ordered) {
    const position = state[trade.symbol];
    if (trade.side === "buy") {
      position.quantity += trade.quantity;
      position.cost += trade.amount - trade.fee;
    } else {
      const share = position.quantity > 0 ? Math.min(1, trade.quantity / position.quantity) : 1;
      position.cost -= position.cost * share;
      position.quantity -= trade.quantity;
    }
    if (position.quantity < DUST) position.quantity = 0;
    if (position.quantity === 0) position.cost = 0;
  }
  return Object.fromEntries(
    CRYPTO_SYMBOLS.map((symbol) => {
      const { quantity, cost } = state[symbol];
      return [symbol, { quantity, averageCost: quantity > 0 ? Math.round(cost / quantity) : 0 }];
    }),
  ) as Record<CryptoSymbol, Position>;
}

/** Coins of `symbol` held at `time`. */
export function quantityAt(trades: TradeRecord[], symbol: CryptoSymbol, time: number): number {
  let quantity = 0;
  for (const trade of trades) {
    if (trade.symbol !== symbol || trade.occurredAt.getTime() > time) continue;
    quantity += trade.side === "buy" ? trade.quantity : -trade.quantity;
  }
  return quantity < DUST ? 0 : quantity;
}
