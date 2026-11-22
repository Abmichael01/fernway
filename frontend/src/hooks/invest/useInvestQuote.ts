"use client";

import { useQuery } from "@tanstack/react-query";
import { getInvestQuote } from "@/api/invest";
import type { TradeSide } from "@/types/invest";
import { investKeys } from "./keys";

/** `target` is a portfolio id or coin symbol. Pass `amount` null to skip fetching. */
export function useInvestQuote(side: TradeSide, target: string, amount: number | null) {
  return useQuery({
    queryKey: investKeys.quote(side, target, amount ?? 0),
    queryFn: () => getInvestQuote(side, target, amount ?? 0),
    enabled: amount !== null && amount > 0,
    retry: false,
    staleTime: 10_000,
  });
}
