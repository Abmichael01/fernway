"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminPortfolio } from "@/api/admin-invest";
import { investAdminKeys } from "./keys";

export function useDeletePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminPortfolio,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: investAdminKeys.all }),
  });
}
