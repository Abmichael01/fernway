"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDepositAddress } from "@/api/invest";
import { investKeys } from "./keys";

export function useCreateDepositAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDepositAddress,
    onSuccess: (data) => queryClient.setQueryData(investKeys.deposits, data),
  });
}
