"use client";

import { useQuery } from "@tanstack/react-query";
import { getBalanceHistory } from "@/api/accounts";
import { queryKeys } from "@/hooks/query-keys";

export function useBalanceHistory(days = 30) {
  return useQuery({
    queryKey: queryKeys.balanceHistory(days),
    queryFn: () => getBalanceHistory(days),
  });
}
