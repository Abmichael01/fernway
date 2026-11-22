"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payAdminWithdrawal } from "@/api/admin-invest";
import { investAdminKeys } from "./keys";

export function usePayWithdrawal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (txid: string) => payAdminWithdrawal(id, txid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: investAdminKeys.all }),
  });
}
