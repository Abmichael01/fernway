"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/api/transactions";
import { queryKeys } from "@/hooks/query-keys";
import type { TransactionFilters } from "@/types/banking";

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: () => getTransactions(filters),
    placeholderData: keepPreviousData,
  });
}
