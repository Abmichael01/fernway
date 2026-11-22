"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminInvestCustomers } from "@/api/admin-invest";
import { investAdminKeys } from "./keys";

export function useInvestCustomers() {
  return useQuery({ queryKey: investAdminKeys.customers, queryFn: getAdminInvestCustomers });
}
