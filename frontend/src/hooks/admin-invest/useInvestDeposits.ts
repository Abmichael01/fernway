"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminDeposits } from "@/api/admin-invest";
import { investAdminKeys } from "./keys";

export function useInvestDeposits() {
  return useQuery({ queryKey: investAdminKeys.deposits, queryFn: getAdminDeposits });
}
