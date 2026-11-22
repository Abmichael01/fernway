"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminWithdrawals } from "@/api/admin-invest";
import type { WithdrawalStatus } from "@/types/invest";
import { investAdminKeys } from "./keys";

/** Omit `status` for every withdrawal. */
export function useInvestWithdrawals(status?: WithdrawalStatus) {
  return useQuery({ queryKey: investAdminKeys.withdrawals(status), queryFn: () => getAdminWithdrawals(status) });
}
