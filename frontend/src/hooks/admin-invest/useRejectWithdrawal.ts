"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectAdminWithdrawal } from "@/api/admin-invest";
import { investAdminKeys } from "./keys";

export function useRejectWithdrawal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => rejectAdminWithdrawal(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: investAdminKeys.all }),
  });
}
