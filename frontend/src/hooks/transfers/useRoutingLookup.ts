"use client";

import { useQuery } from "@tanstack/react-query";
import { lookupRoutingNumber } from "@/api/transfers";
import { queryKeys } from "@/hooks/query-keys";
import { isValidRoutingNumber } from "@/lib/routing";

/** Finds the bank for a routing number once a checksum-valid 9-digit number is entered. */
export function useRoutingLookup(routingNumber: string) {
  return useQuery({
    queryKey: queryKeys.transfers.routing(routingNumber),
    queryFn: () => lookupRoutingNumber(routingNumber),
    enabled: isValidRoutingNumber(routingNumber),
    staleTime: 60 * 60_000,
    retry: false,
  });
}
