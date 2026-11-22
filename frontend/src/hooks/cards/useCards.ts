"use client";

import { useQuery } from "@tanstack/react-query";
import { getCards } from "@/api/cards";
import { queryKeys } from "@/hooks/query-keys";

export function useCards() {
  return useQuery({
    queryKey: queryKeys.cards,
    queryFn: getCards,
  });
}
