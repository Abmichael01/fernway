"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCard } from "@/api/cards";
import { queryKeys } from "@/hooks/query-keys";
import type { CreateCardInput } from "@/schemas/card";

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCardInput) => createCard(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers });
    },
  });
}
