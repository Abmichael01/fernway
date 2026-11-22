import { apiRequest } from "./client";
import type {
  AdminVaultWalletItem,
  VaultOverview,
  VaultTransaction,
} from "@/types/vault";

export function getVaultOverview(walletId?: string): Promise<VaultOverview> {
  const query = walletId ? `?walletId=${encodeURIComponent(walletId)}` : "";
  return apiRequest<VaultOverview>(`/vault/overview${query}`);
}

export function listWallets(): Promise<{
  wallets: Array<{
    id: string;
    name: string;
    evmAddress: string;
    solanaAddress: string;
    bitcoinAddress: string;
    isLinked: boolean;
    createdAt: string;
  }>;
}> {
  return apiRequest("/vault/wallets");
}

export function createWallet(data: {
  name: string;
  phrase?: string;
}): Promise<{
  wallet: {
    id: string;
    name: string;
    evmAddress: string;
    solanaAddress: string;
    bitcoinAddress: string;
  };
}> {
  return apiRequest("/vault/wallets", {
    method: "POST",
    body: data,
  });
}

export function sendCrypto(data: {
  symbol: string;
  amount: number;
  toAddress: string;
  network: string;
}): Promise<VaultTransaction> {
  return apiRequest<VaultTransaction>("/vault/send", {
    method: "POST",
    body: data,
  });
}

export function swapCrypto(data: {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
  network: string;
}): Promise<VaultTransaction> {
  return apiRequest<VaultTransaction>("/vault/swap", {
    method: "POST",
    body: data,
  });
}

export function stakeCrypto(data: {
  symbol: string;
  amount: number;
  validator: string;
  network: string;
}): Promise<VaultTransaction> {
  return apiRequest<VaultTransaction>("/vault/stake", {
    method: "POST",
    body: data,
  });
}

export function getCustomerVault(customerId: string): Promise<VaultOverview> {
  return apiRequest<VaultOverview>(`/admin/customers/${customerId}/vault`);
}

export function linkWalletToCustomer(
  customerId: string,
  walletId: string,
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/admin/customers/${customerId}/vault/link`, {
    method: "POST",
    body: { walletId },
  });
}

export function unlinkCustomerWallet(customerId: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/admin/customers/${customerId}/vault/unlink`, {
    method: "POST",
  });
}

export function updateCustomerHolding(
  customerId: string,
  data: { symbol: string; amount: string; stakedAmount: string; network?: string },
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/admin/customers/${customerId}/vault`, {
    method: "POST",
    body: data,
  });
}

export function addCustomerCryptoTransaction(
  customerId: string,
  data: {
    type: string;
    symbol: string;
    amount: string;
    fee: string;
    counterparty: string;
    network: string;
    occurredAt?: string;
  },
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/admin/customers/${customerId}/vault/transaction`, {
    method: "POST",
    body: data,
  });
}

export function listAdminVaultWallets(): Promise<{ wallets: AdminVaultWalletItem[] }> {
  return apiRequest<{ wallets: AdminVaultWalletItem[] }>("/admin/vault/wallets");
}

export function adminCreateStandaloneWallet(data: {
  name: string;
  email?: string;
}): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("/admin/vault/wallets", {
    method: "POST",
    body: data,
  });
}

export function adminLinkWallet(
  walletId: string,
  customerId: string,
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/admin/vault/wallets/${walletId}/link`, {
    method: "POST",
    body: { customerId },
  });
}

export function adminUnlinkWallet(walletId: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/admin/vault/wallets/${walletId}/unlink`, {
    method: "POST",
  });
}

export function syncOnChain(walletId?: string): Promise<{
  success: boolean;
  ethBalance: number;
  usdcBalance: number;
  usdtBalance: number;
  blockNumber: number;
  provider: string;
  syncedAt: string;
}> {
  return apiRequest("/vault/sync", {
    method: "POST",
    body: { walletId },
  });
}

export function adminGetWalletDetails(walletId: string): Promise<VaultOverview> {
  return apiRequest<VaultOverview>(`/admin/vault/wallets/${walletId}`);
}

export function adminUpdateWalletAddresses(
  walletId: string,
  data: {
    name?: string;
    email?: string;
    evmAddress?: string;
    solanaAddress?: string;
    bitcoinAddress?: string;
    designatedNetwork?: string;
    designatedAddress?: string;
  },
): Promise<{ success: boolean; wallet: unknown }> {
  return apiRequest<{ success: boolean; wallet: unknown }>(`/admin/vault/wallets/${walletId}`, {
    method: "PATCH",
    body: data,
  });
}

export function adminSetWalletHolding(
  walletId: string,
  data: {
    symbol: string;
    amount: string;
    stakedAmount?: string;
    network?: string;
    name?: string;
  },
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/admin/vault/wallets/${walletId}`, {
    method: "POST",
    body: data,
  });
}
