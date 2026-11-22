"use client";

import { useQuery } from "@tanstack/react-query";
import { getInvestOverview } from "@/api/invest";
import { investKeys } from "./keys";

export function useInvestOverview() {
  return useQuery({ queryKey: investKeys.overview, queryFn: getInvestOverview, staleTime: 30_000 });
}
