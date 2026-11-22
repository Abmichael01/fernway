"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminInvestStats } from "@/api/admin-invest";
import { investAdminKeys } from "./keys";

export function useInvestStats() {
  return useQuery({ queryKey: investAdminKeys.stats, queryFn: getAdminInvestStats });
}
