"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addTransaction, deleteTransaction, listCustomerTransactions, recordCryptoBuy, updateTransaction } from "@/api/admin";
import { queryKeys } from "@/hooks/query-keys";
import type { TransactionInput } from "@/schemas/admin";
import type { AdminTradeInput } from "@/schemas/trade";

export function useCustomerTransactions(customerId: string, accountId?: string) {
  return useQuery({
    queryKey: queryKeys.admin.transactions(customerId, accountId),
    queryFn: () => listCustomerTransactions(customerId, accountId),
  });
}

/** A ledger change moves balances, card spend and the list totals, so refresh all admin data. */
function useLedgerMutation<Variables, Result>(mutationFn: (variables: Variables) => Promise<Result>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.all }),
  });
}

export function useAddTransaction() {
  return useLedgerMutation(({ accountId, input }: { accountId: string; input: TransactionInput }) =>
    addTransaction(accountId, input),
  );
}

export function useUpdateTransaction() {
  return useLedgerMutation(({ transactionId, input }: { transactionId: string; input: TransactionInput }) =>
    updateTransaction(transactionId, input),
  );
}

export function useDeleteTransaction() {
  return useLedgerMutation(deleteTransaction);
}

/** A past crypto buy: a cash debit plus the coins, priced at that moment's market price. */
export function useRecordCryptoBuy(customerId: string) {
  return useLedgerMutation((input: AdminTradeInput) => recordCryptoBuy(customerId, input));
}
