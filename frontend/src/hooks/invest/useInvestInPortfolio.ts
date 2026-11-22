"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { investInPortfolio } from "@/api/invest";
import { invalidateAfterMoneyMovement } from "./invalidate";

export function useInvestInPortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => investInPortfolio(id, amount),
    onSuccess: () => invalidateAfterMoneyMovement(queryClient),
  });
}
