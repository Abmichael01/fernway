"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveBetweenAccounts } from "@/api/accounts";
import { queryKeys } from "@/hooks/query-keys";

export function useMoveBetweenAccounts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveBetweenAccounts,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
      ]),
  });
}
