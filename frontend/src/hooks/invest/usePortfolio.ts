"use client";

import { useQuery } from "@tanstack/react-query";
import { getPortfolio } from "@/api/invest";
import { investKeys } from "./keys";

export function usePortfolio(id: string) {
  return useQuery({ queryKey: investKeys.portfolio(id), queryFn: () => getPortfolio(id), staleTime: 60_000 });
}
