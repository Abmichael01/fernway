"use client";

import { useQuery } from "@tanstack/react-query";
import { getWithdrawals } from "@/api/invest";
import { investKeys } from "./keys";

export function useWithdrawals() {
  return useQuery({ queryKey: investKeys.withdrawals, queryFn: getWithdrawals, staleTime: 30_000 });
}
