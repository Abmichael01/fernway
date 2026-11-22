"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelWithdrawal } from "@/api/invest";
import { invalidateAfterMoneyMovement } from "./invalidate";

export function useCancelWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelWithdrawal,
    onSuccess: () => invalidateAfterMoneyMovement(queryClient),
  });
}
