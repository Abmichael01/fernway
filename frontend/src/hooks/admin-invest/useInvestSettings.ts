"use client";

import { useQuery } from "@tanstack/react-query";
import { getInvestSettings } from "@/api/admin-invest";
import { investAdminKeys } from "./keys";

export function useInvestSettings() {
  return useQuery({ queryKey: investAdminKeys.settings, queryFn: getInvestSettings });
}
