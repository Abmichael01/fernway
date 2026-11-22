import type {
  CryptoAsset,
  CryptoSymbol,
  MarketPrice,
  PricePoint,
  PriceRange,
  Transaction,
  TradeQuote,
  TradeRequest,
  TrendPoint,
} from "@/types/banking";
import { apiRequest } from "./client";

/** Public market prices for the homepage; works signed out. */
export function getMarketPrices(): Promise<MarketPrice[]> {
  return apiRequest<MarketPrice[]>("/crypto/market");
}

/** Every supported coin with today's market price and the customer's holding. */
export function getCryptoAssets(): Promise<CryptoAsset[]> {
  return apiRequest<CryptoAsset[]>("/crypto/assets");
}

export function getPriceHistory(symbol: CryptoSymbol, range: PriceRange): Promise<PricePoint[]> {
  return apiRequest<PricePoint[]>(`/crypto/prices?symbol=${symbol}&range=${range}`);
}

/** Value of the customer's coins over time, from their trades and market prices. */
export function getPortfolioHistory(range: PriceRange): Promise<TrendPoint[]> {
  return apiRequest<TrendPoint[]>(`/crypto/portfolio?range=${range}`);
}

export function getTradeQuote(request: Omit<TradeRequest, "accountId">): Promise<TradeQuote> {
  const { side, symbol, amount } = request;
  return apiRequest<TradeQuote>(`/crypto/quote?side=${side}&symbol=${symbol}&amount=${amount}`);
}

export function placeTrade(request: TradeRequest): Promise<Transaction> {
  return apiRequest<Transaction>("/crypto/trades", { method: "POST", body: request });
}
