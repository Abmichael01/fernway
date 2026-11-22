"use client";

import { useQuery } from "@tanstack/react-query";
import { getInvestPrices } from "@/api/invest";
import { investKeys } from "./keys";

export function useInvestPrices() {
  return useQuery({ queryKey: investKeys.prices, queryFn: getInvestPrices, staleTime: 30_000, refetchInterval: 60_000 });
}
