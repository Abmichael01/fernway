import type {
  CashFlowWeek,
  MonthSummary,
  Transaction,
  TransactionFilters,
  TrendPoint,
  UpcomingPayment,
} from "@/types/banking";
import { apiRequest } from "./client";

export function queryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export function getTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
  return apiRequest<Transaction[]>(`/transactions${queryString({ ...filters })}`);
}

export function getMonthSummary(): Promise<MonthSummary> {
  return apiRequest<MonthSummary>("/insights/month");
}

/** Weekly money in and out, oldest week first. */
export function getCashFlow(weeks = 8): Promise<CashFlowWeek[]> {
  return apiRequest<CashFlowWeek[]>(`/insights/cash-flow${queryString({ weeks })}`);
}

/** Running net (money in minus money out) for each day of the current month so far. */
export function getNetTrend(): Promise<TrendPoint[]> {
  return apiRequest<TrendPoint[]>("/insights/net-trend");
}

export function getUpcomingPayments(): Promise<UpcomingPayment[]> {
  return apiRequest<UpcomingPayment[]>("/insights/upcoming");
}
