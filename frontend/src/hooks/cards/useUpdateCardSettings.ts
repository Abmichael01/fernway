"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type CardSettingsUpdate, updateCardSettings } from "@/api/cards";
import { queryKeys } from "@/hooks/query-keys";
import type { PaymentCard } from "@/types/banking";

interface Variables {
  cardId: string;
  update: CardSettingsUpdate;
}

/** Applies the change immediately and rolls back if the server rejects it. */
export function useUpdateCardSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, update }: Variables) => updateCardSettings(cardId, update),
    onMutate: async ({ cardId, update }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cards });
      const previous = queryClient.getQueryData<PaymentCard[]>(queryKeys.cards);
      queryClient.setQueryData<PaymentCard[]>(queryKeys.cards, (cards) =>
        cards?.map((card) => (card.id === cardId ? { ...card, ...update } : card)),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.cards, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.cards }),
  });
}
