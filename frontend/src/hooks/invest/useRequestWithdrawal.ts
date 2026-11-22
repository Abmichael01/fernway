"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestWithdrawal } from "@/api/invest";
import { invalidateAfterMoneyMovement } from "./invalidate";

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestWithdrawal,
    onSuccess: () => invalidateAfterMoneyMovement(queryClient),
  });
}
