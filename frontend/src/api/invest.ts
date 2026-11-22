/**
 * Fernway Invest customer API. Separate sign-in (`fw_invest_session` cookie) from Banking;
 * the CSRF cookie and `apiRequest` plumbing are shared.
 */
import type { PriceRange, TradeSide, TrendPoint } from "@/types/banking";
import type {
  CryptoSymbol,
  InvestCheckout,
  InvestDeposits,
  InvestMarketPrice,
  InvestOverview,
  InvestQuote,
  InvestTransaction,
  InvestUser,
  Portfolio,
  Withdrawal,
} from "@/types/invest";
import { apiRequest } from "./client";

export function investSignIn(input: { email: string; password: string }): Promise<InvestUser> {
  return apiRequest<InvestUser>("/invest/auth/login", { method: "POST", body: input });
}

export function investQuickLogin(email: string): Promise<InvestUser> {
  return apiRequest<InvestUser>("/invest/auth/quick-login", { method: "POST", body: { email } });
}

export function investSignOut(): Promise<void> {
  return apiRequest<void>("/invest/auth/logout", { method: "POST" });
}

export function getInvestMe(): Promise<InvestUser> {
  return apiRequest<InvestUser>("/invest/auth/me");
}

export function getInvestOverview(): Promise<InvestOverview> {
  return apiRequest<InvestOverview>("/invest/overview");
}

/** Value of everything the customer holds over the range, from their trades and real prices. */
export function getInvestHistory(range: PriceRange): Promise<TrendPoint[]> {
  return apiRequest<TrendPoint[]>(`/invest/history?range=${range}`);
}

export function getInvestPrices(): Promise<InvestMarketPrice[]> {
  return apiRequest<InvestMarketPrice[]>("/invest/prices");
}

/** Published managed portfolios. */
export function getPortfolios(): Promise<Portfolio[]> {
  return apiRequest<Portfolio[]>("/invest/portfolios");
}

export function getPortfolio(id: string): Promise<Portfolio> {
  return apiRequest<Portfolio>(`/invest/portfolios/${id}`);
}

/** `target` is a portfolio id or a coin symbol. */
export function getInvestQuote(side: TradeSide, target: string, amount: number): Promise<InvestQuote> {
  return apiRequest<InvestQuote>(`/invest/quote?side=${side}&target=${encodeURIComponent(target)}&amount=${amount}`);
}

export function investInPortfolio(id: string, amount: number): Promise<InvestTransaction> {
  return apiRequest<InvestTransaction>(`/invest/portfolios/${id}/invest`, { method: "POST", body: { amount } });
}

export function withdrawFromPortfolio(id: string, request: { amount: number } | { all: true }): Promise<InvestTransaction> {
  return apiRequest<InvestTransaction>(`/invest/portfolios/${id}/withdraw`, { method: "POST", body: request });
}

export function placeInvestTrade(request: { side: TradeSide; symbol: CryptoSymbol; amount: number }): Promise<InvestTransaction> {
  return apiRequest<InvestTransaction>("/invest/trades", { method: "POST", body: request });
}

export function getInvestTransactions(): Promise<InvestTransaction[]> {
  return apiRequest<InvestTransaction[]>("/invest/transactions");
}

export function getInvestDeposits(): Promise<InvestDeposits> {
  return apiRequest<InvestDeposits>("/invest/deposits");
}

/** Creates (or returns) the customer's deposit address for a coin. */
export function createDepositAddress(symbol: CryptoSymbol): Promise<InvestDeposits> {
  return apiRequest<InvestDeposits>("/invest/deposits", { method: "POST", body: { symbol } });
}

export function createInvestCheckout(input: { amount: number; description: string }): Promise<InvestCheckout> {
  return apiRequest<InvestCheckout>("/invest/checkout", { method: "POST", body: input });
}

export function getWithdrawals(): Promise<Withdrawal[]> {
  return apiRequest<Withdrawal[]>("/invest/withdrawals");
}

export function requestWithdrawal(request: { symbol: CryptoSymbol; address: string; amount: number }): Promise<Withdrawal> {
  return apiRequest<Withdrawal>("/invest/withdrawals", { method: "POST", body: request });
}

export function cancelWithdrawal(id: string): Promise<Withdrawal> {
  return apiRequest<Withdrawal>(`/invest/withdrawals/${id}/cancel`, { method: "POST" });
}
