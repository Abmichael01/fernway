"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordAdminInvestEarning } from "@/api/admin-invest";
import type { AdminRecordEarningInput } from "@/schemas/invest";
import { investAdminKeys } from "./keys";

export function useRecordInvestEarning(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminRecordEarningInput) => recordAdminInvestEarning(customerId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: investAdminKeys.all }),
  });
}
