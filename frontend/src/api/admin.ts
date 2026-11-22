import { parseMajorAmount } from "@/lib/money";
import type {
  AccountOpenInput,
  AccountOpenValues,
  BillFormValues,
  BillInput,
  CardIssueInput,
  CardIssueValues,
  CustomerCreateValues,
  CustomerUpdateValues,
  TransactionFormValues,
  TransactionInput,
} from "@/schemas/admin";
import type { AdminTradeFormValues, AdminTradeInput } from "@/schemas/trade";
import type { AdminCustomer, AdminCustomerSummary, AdminStats } from "@/types/admin";
import type { Transaction } from "@/types/banking";
import { apiRequest } from "./client";
import { queryString } from "./transactions";

const cents = (value: string) => parseMajorAmount(value) ?? 0;

/* Form values (as typed) → API payloads (cents, ISO dates). */

export function toTransactionInput(values: TransactionFormValues): TransactionInput {
  return {
    direction: values.direction,
    amount: cents(values.amount),
    fee: values.direction === "debit" && values.fee ? cents(values.fee) : 0,
    counterparty: values.counterparty,
    counterpartyDetail: values.counterpartyDetail || null,
    narration: values.narration,
    category: values.category,
    channel: values.channel,
    status: values.status,
    occurredAt: new Date(values.occurredAt).toISOString(),
    cardId: values.channel === "card" && values.cardId ? values.cardId : null,
  };
}

export function toAccountInput(values: AccountOpenValues): AccountOpenInput {
  return {
    type: values.type,
    name: values.name,
    apyBps: values.type === "savings" && values.apy ? Math.round(Number(values.apy) * 100) : 0,
    goalName: values.goalName || null,
    goalTarget: values.goalTarget ? cents(values.goalTarget) || null : null,
  };
}

export function toCardInput(values: CardIssueValues): CardIssueInput {
  return { accountId: values.accountId, kind: values.kind, label: values.label, monthlyLimit: cents(values.monthlyLimit) };
}

export function toBillInput(values: BillFormValues): BillInput {
  return {
    accountId: values.accountId,
    payee: values.payee,
    category: values.category,
    amount: cents(values.amount),
    dayOfMonth: Number(values.dayOfMonth),
    autopay: values.autopay,
  };
}

/* Endpoints */

export function getAdminStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>("/admin/stats");
}

export function listCustomers(): Promise<AdminCustomerSummary[]> {
  return apiRequest<AdminCustomerSummary[]>("/admin/customers");
}

export function getCustomer(id: string): Promise<AdminCustomer> {
  return apiRequest<AdminCustomer>(`/admin/customers/${encodeURIComponent(id)}`);
}

export function createCustomer(values: CustomerCreateValues): Promise<AdminCustomer> {
  return apiRequest<AdminCustomer>("/admin/customers", { method: "POST", body: values });
}

export function updateCustomer(id: string, values: CustomerUpdateValues): Promise<AdminCustomer> {
  return apiRequest<AdminCustomer>(`/admin/customers/${encodeURIComponent(id)}`, { method: "PATCH", body: values });
}

export function setCustomerPassword(id: string, password: string): Promise<void> {
  return apiRequest<void>(`/admin/customers/${encodeURIComponent(id)}/password`, { method: "POST", body: { password } });
}

export function openAccount(customerId: string, input: AccountOpenInput): Promise<AdminCustomer> {
  return apiRequest<AdminCustomer>(`/admin/customers/${encodeURIComponent(customerId)}/accounts`, { method: "POST", body: input });
}

export function issueCard(customerId: string, input: CardIssueInput): Promise<AdminCustomer> {
  return apiRequest<AdminCustomer>(`/admin/customers/${encodeURIComponent(customerId)}/cards`, { method: "POST", body: input });
}

export function addBill(customerId: string, input: BillInput): Promise<AdminCustomer> {
  return apiRequest<AdminCustomer>(`/admin/customers/${encodeURIComponent(customerId)}/bills`, { method: "POST", body: input });
}

export function deleteBill(billId: string): Promise<AdminCustomer> {
  return apiRequest<AdminCustomer>(`/admin/bills/${encodeURIComponent(billId)}`, { method: "DELETE" });
}

export function listCustomerTransactions(customerId: string, accountId?: string): Promise<Transaction[]> {
  return apiRequest<Transaction[]>(`/admin/customers/${encodeURIComponent(customerId)}/transactions${queryString({ accountId })}`);
}

export function addTransaction(accountId: string, input: TransactionInput): Promise<Transaction> {
  return apiRequest<Transaction>(`/admin/accounts/${encodeURIComponent(accountId)}/transactions`, { method: "POST", body: input });
}

export function updateTransaction(transactionId: string, input: TransactionInput): Promise<Transaction> {
  return apiRequest<Transaction>(`/admin/transactions/${encodeURIComponent(transactionId)}`, { method: "PATCH", body: input });
}

export function deleteTransaction(transactionId: string): Promise<void> {
  return apiRequest<void>(`/admin/transactions/${encodeURIComponent(transactionId)}`, { method: "DELETE" });
}

export function recordCryptoBuy(customerId: string, input: AdminTradeInput): Promise<Transaction> {
  return apiRequest<Transaction>(`/admin/customers/${encodeURIComponent(customerId)}/crypto-trades`, { method: "POST", body: input });
}

export function toAdminTradeInput(values: AdminTradeFormValues): AdminTradeInput {
  return {
    accountId: values.accountId,
    symbol: values.symbol,
    amount: cents(values.amount),
    occurredAt: new Date(values.occurredAt).toISOString(),
  };
}
