"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminInvestCustomer } from "@/api/admin-invest";
import type { AdminInvestCustomerUpdateInput } from "@/schemas/invest";
import { investAdminKeys } from "./keys";

export function useUpdateInvestCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminInvestCustomerUpdateInput) => updateAdminInvestCustomer(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: investAdminKeys.all }),
  });
}
