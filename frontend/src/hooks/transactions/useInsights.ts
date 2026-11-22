"use client";

import { useQuery } from "@tanstack/react-query";
import { getCashFlow, getMonthSummary, getNetTrend, getUpcomingPayments } from "@/api/transactions";
import { queryKeys } from "@/hooks/query-keys";

export function useMonthSummary() {
  return useQuery({
    queryKey: queryKeys.transactions.monthSummary,
    queryFn: getMonthSummary,
  });
}

export function useCashFlow(weeks = 8) {
  return useQuery({
    queryKey: queryKeys.transactions.cashFlow(weeks),
    queryFn: () => getCashFlow(weeks),
  });
}

export function useNetTrend() {
  return useQuery({
    queryKey: queryKeys.transactions.netTrend,
    queryFn: getNetTrend,
  });
}

export function useUpcomingPayments() {
  return useQuery({
    queryKey: queryKeys.transactions.upcoming,
    queryFn: getUpcomingPayments,
    staleTime: 10 * 60_000,
  });
}
