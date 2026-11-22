"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransferQuote } from "@/api/transfers";
import { queryKeys } from "@/hooks/query-keys";
import type { TransferMethod } from "@/types/banking";

export function useTransferQuote(method: TransferMethod, amount: number | null) {
  return useQuery({
    queryKey: queryKeys.transfers.quote(method, amount ?? 0),
    queryFn: () => getTransferQuote(method, amount ?? 0),
    enabled: amount !== null && amount > 0,
    staleTime: 5 * 60_000,
  });
}
