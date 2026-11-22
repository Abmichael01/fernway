"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminInvestCustomer } from "@/api/admin-invest";
import { investAdminKeys } from "./keys";

export function useCreateInvestCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminInvestCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: investAdminKeys.all }),
  });
}
