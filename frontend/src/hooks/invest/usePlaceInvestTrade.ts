"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { placeInvestTrade } from "@/api/invest";
import { invalidateAfterMoneyMovement } from "./invalidate";

export function usePlaceInvestTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeInvestTrade,
    onSuccess: () => invalidateAfterMoneyMovement(queryClient),
  });
}
