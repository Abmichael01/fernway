"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminInvestCustomer } from "@/api/admin-invest";
import { investAdminKeys } from "./keys";

export function useInvestCustomer(id: string) {
  return useQuery({ queryKey: investAdminKeys.customer(id), queryFn: () => getAdminInvestCustomer(id) });
}
