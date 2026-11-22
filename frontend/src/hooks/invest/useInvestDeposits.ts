"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getInvestDeposits } from "@/api/invest";
import { invalidateAfterMoneyMovement } from "./invalidate";
import { investKeys } from "./keys";

/**
 * Refetches every 30 seconds while the page is open so new payments show up. When a payment
 * becomes credited, cash, history and transactions are refreshed too.
 */
export function useInvestDeposits() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: investKeys.deposits,
    queryFn: getInvestDeposits,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
  const credited = query.data?.payments.filter((payment) => payment.status === "credited").length;
  const seen = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (credited === undefined) return;
    if (seen.current !== undefined && credited > seen.current) void invalidateAfterMoneyMovement(queryClient);
    seen.current = credited;
  }, [credited, queryClient]);
  return query;
}
