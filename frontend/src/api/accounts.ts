import type { Account, BalanceHistory, InternalTransferRequest, Transaction } from "@/types/banking";
import { apiRequest } from "./client";

export function getAccounts(): Promise<Account[]> {
  return apiRequest<Account[]>("/accounts");
}

/** End-of-day balances for the last `days` days; the last point equals today's balance. */
export function getBalanceHistory(days = 30): Promise<BalanceHistory> {
  return apiRequest<BalanceHistory>(`/accounts/history?days=${days}`);
}

/** Moves money between the customer's own accounts. Instant and free. */
export function moveBetweenAccounts(request: InternalTransferRequest): Promise<Transaction> {
  return apiRequest<Transaction>("/accounts/move", { method: "POST", body: request });
}
