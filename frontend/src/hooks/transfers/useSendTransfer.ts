"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendTransfer } from "@/api/transfers";
import { queryKeys } from "@/hooks/query-keys";

export function useSendTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendTransfer,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
        queryClient.invalidateQueries({ queryKey: ["insights"] }),
      ]),
  });
}
