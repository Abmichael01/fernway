"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminPortfolios } from "@/api/admin-invest";
import { investAdminKeys } from "./keys";

export function useInvestPortfolios() {
  return useQuery({ queryKey: investAdminKeys.portfolios, queryFn: getAdminPortfolios });
}
