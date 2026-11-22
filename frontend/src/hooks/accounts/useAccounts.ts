"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "@/api/accounts";
import { queryKeys } from "@/hooks/query-keys";

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: getAccounts,
  });
}
