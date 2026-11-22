"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addBill,
  createCustomer,
  deleteBill,
  getAdminStats,
  getCustomer,
  issueCard,
  listCustomers,
  openAccount,
  setCustomerPassword,
  updateCustomer,
} from "@/api/admin";
import { queryKeys } from "@/hooks/query-keys";
import type { AccountOpenInput, BillInput, CardIssueInput, CustomerUpdateValues } from "@/schemas/admin";
import type { AdminCustomer } from "@/types/admin";

export function useAdminStats() {
  return useQuery({ queryKey: queryKeys.admin.stats, queryFn: getAdminStats });
}

export function useCustomers() {
  return useQuery({ queryKey: queryKeys.admin.customers, queryFn: listCustomers });
}

export function useCustomer(id: string) {
  return useQuery({ queryKey: queryKeys.admin.customer(id), queryFn: () => getCustomer(id) });
}

/** Every customer mutation returns the full customer; store it and refresh the list. */
function useCustomerMutation<Variables>(mutationFn: (variables: Variables) => Promise<AdminCustomer>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (customer) => {
      queryClient.setQueryData(queryKeys.admin.customer(customer.id), customer);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers, exact: true });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
    },
  });
}

export function useCreateCustomer() {
  return useCustomerMutation(createCustomer);
}

export function useUpdateCustomer(id: string) {
  return useCustomerMutation((values: CustomerUpdateValues) => updateCustomer(id, values));
}

export function useOpenAccount(customerId: string) {
  return useCustomerMutation((input: AccountOpenInput) => openAccount(customerId, input));
}

export function useIssueCard(customerId: string) {
  return useCustomerMutation((input: CardIssueInput) => issueCard(customerId, input));
}

export function useAddBill(customerId: string) {
  return useCustomerMutation((input: BillInput) => addBill(customerId, input));
}

export function useDeleteBill() {
  return useCustomerMutation(deleteBill);
}

export function useSetCustomerPassword(customerId: string) {
  return useMutation({ mutationFn: (password: string) => setCustomerPassword(customerId, password) });
}
