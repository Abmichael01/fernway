"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getInvestHistory } from "@/api/invest";
import type { PriceRange } from "@/types/invest";
import { investKeys } from "./keys";

export function useInvestHistory(range: PriceRange) {
  return useQuery({
    queryKey: investKeys.history(range),
    queryFn: () => getInvestHistory(range),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
