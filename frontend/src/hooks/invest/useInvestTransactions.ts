"use client";

import { useQuery } from "@tanstack/react-query";
import { getInvestTransactions } from "@/api/invest";
import { investKeys } from "./keys";

export function useInvestTransactions() {
  return useQuery({ queryKey: investKeys.transactions, queryFn: getInvestTransactions, staleTime: 30_000 });
}
