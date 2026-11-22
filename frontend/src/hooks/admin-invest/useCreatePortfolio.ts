"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminPortfolio } from "@/api/admin-invest";
import { investAdminKeys } from "./keys";

export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminPortfolio,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: investAdminKeys.all }),
  });
}
