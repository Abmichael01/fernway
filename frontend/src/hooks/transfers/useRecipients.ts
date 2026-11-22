"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecipients } from "@/api/transfers";
import { queryKeys } from "@/hooks/query-keys";

export function useRecipients() {
  return useQuery({
    queryKey: queryKeys.transfers.recipients,
    queryFn: getRecipients,
  });
}
