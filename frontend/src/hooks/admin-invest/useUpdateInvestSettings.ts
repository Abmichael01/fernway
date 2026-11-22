"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInvestSettings } from "@/api/admin-invest";
import { investAdminKeys } from "./keys";

export function useUpdateInvestSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInvestSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: investAdminKeys.all }),
  });
}
