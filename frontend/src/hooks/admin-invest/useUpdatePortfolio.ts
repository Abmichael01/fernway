"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminPortfolio } from "@/api/admin-invest";
import type { AdminPortfolioUpdateInput } from "@/schemas/invest";
import { investAdminKeys } from "./keys";

export function useUpdatePortfolio(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminPortfolioUpdateInput) => updateAdminPortfolio(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: investAdminKeys.all }),
  });
}
