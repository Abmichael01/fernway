"use client";

import { useQuery } from "@tanstack/react-query";
import { getPortfolios } from "@/api/invest";
import { investKeys } from "./keys";

export function usePortfolios() {
  return useQuery({ queryKey: investKeys.portfolios, queryFn: getPortfolios, staleTime: 60_000 });
}
