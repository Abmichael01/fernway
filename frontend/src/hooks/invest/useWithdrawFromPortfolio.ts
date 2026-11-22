"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawFromPortfolio } from "@/api/invest";
import { invalidateAfterMoneyMovement } from "./invalidate";

export function useWithdrawFromPortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: { amount: number } | { all: true } }) =>
      withdrawFromPortfolio(id, request),
    onSuccess: () => invalidateAfterMoneyMovement(queryClient),
  });
}
