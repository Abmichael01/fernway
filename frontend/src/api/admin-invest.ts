/** Admin endpoints for Fernway Invest. The admin signs in through the main admin (`/admin`). */
import type {
  AdminInvestCustomerCreateInput,
  AdminInvestCustomerUpdateInput,
  AdminPortfolioInput,
  AdminPortfolioUpdateInput,
  AdminRecordEarningInput,
  InvestSettingsInput,
} from "@/schemas/invest";
import type {
  AdminDepositPayment,
  AdminInvestCustomer,
  AdminInvestCustomerDetail,
  AdminInvestStats,
  AdminPortfolio,
  AdminWithdrawal,
  InvestOverview,
  InvestSettings,
  WithdrawalStatus,
} from "@/types/invest";
import { apiRequest } from "./client";

const BASE = "/admin/invest";

export function getAdminInvestStats(): Promise<AdminInvestStats> {
  return apiRequest<AdminInvestStats>(`${BASE}/stats`);
}

export function getAdminInvestCustomers(): Promise<AdminInvestCustomer[]> {
  return apiRequest<AdminInvestCustomer[]>(`${BASE}/customers`);
}

export function createAdminInvestCustomer(input: AdminInvestCustomerCreateInput): Promise<AdminInvestCustomer> {
  return apiRequest<AdminInvestCustomer>(`${BASE}/customers`, { method: "POST", body: input });
}

export function getAdminInvestCustomer(id: string): Promise<AdminInvestCustomerDetail> {
  return apiRequest<AdminInvestCustomerDetail>(`${BASE}/customers/${id}`);
}

export function updateAdminInvestCustomer(id: string, input: AdminInvestCustomerUpdateInput): Promise<AdminInvestCustomer> {
  return apiRequest<AdminInvestCustomer>(`${BASE}/customers/${id}`, { method: "PATCH", body: input });
}

export function recordAdminInvestEarning(id: string, input: AdminRecordEarningInput): Promise<InvestOverview> {
  return apiRequest<InvestOverview>(`${BASE}/customers/${id}/earning`, { method: "POST", body: input });
}

export function getAdminPortfolios(): Promise<AdminPortfolio[]> {
  return apiRequest<AdminPortfolio[]>(`${BASE}/portfolios`);
}

export function createAdminPortfolio(input: AdminPortfolioInput): Promise<AdminPortfolio> {
  return apiRequest<AdminPortfolio>(`${BASE}/portfolios`, { method: "POST", body: input });
}

export function updateAdminPortfolio(id: string, input: AdminPortfolioUpdateInput): Promise<AdminPortfolio> {
  return apiRequest<AdminPortfolio>(`${BASE}/portfolios/${id}`, { method: "PATCH", body: input });
}

/** Only works while nobody holds anything in it; otherwise unpublish it instead. */
export function deleteAdminPortfolio(id: string): Promise<void> {
  return apiRequest<void>(`${BASE}/portfolios/${id}`, { method: "DELETE" });
}

export function getAdminWithdrawals(status?: WithdrawalStatus): Promise<AdminWithdrawal[]> {
  return apiRequest<AdminWithdrawal[]>(`${BASE}/withdrawals${status ? `?status=${status}` : ""}`);
}

export function payAdminWithdrawal(id: string, txid: string): Promise<AdminWithdrawal> {
  return apiRequest<AdminWithdrawal>(`${BASE}/withdrawals/${id}/pay`, { method: "POST", body: { txid } });
}

export function rejectAdminWithdrawal(id: string, reason: string): Promise<AdminWithdrawal> {
  return apiRequest<AdminWithdrawal>(`${BASE}/withdrawals/${id}/reject`, { method: "POST", body: { reason } });
}

export function getAdminDeposits(): Promise<AdminDepositPayment[]> {
  return apiRequest<AdminDepositPayment[]>(`${BASE}/deposits`);
}

export function getInvestSettings(): Promise<InvestSettings> {
  return apiRequest<InvestSettings>(`${BASE}/settings`);
}

export function updateInvestSettings(input: InvestSettingsInput): Promise<InvestSettings> {
  return apiRequest<InvestSettings>(`${BASE}/settings`, { method: "PUT", body: input });
}
