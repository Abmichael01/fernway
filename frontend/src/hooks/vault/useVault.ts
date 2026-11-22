import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getVaultOverview,
  sendCrypto,
  swapCrypto,
  stakeCrypto,
  getCustomerVault,
  updateCustomerHolding,
  addCustomerCryptoTransaction,
  listWallets,
  createWallet,
  listAdminVaultWallets,
  adminCreateStandaloneWallet,
  adminLinkWallet,
  adminUnlinkWallet,
  linkWalletToCustomer,
  unlinkCustomerWallet,
  syncOnChain,
  adminGetWalletDetails,
  adminUpdateWalletAddresses,
  adminSetWalletHolding,
} from "@/api/vault";
import { queryKeys } from "../query-keys";

export function useVaultOverview(walletId?: string) {
  return useQuery({
    queryKey: queryKeys.vault.overview(walletId),
    queryFn: () => getVaultOverview(walletId),
    refetchInterval: 15_000,
  });
}

export function useWallets() {
  return useQuery({
    queryKey: queryKeys.vault.wallets,
    queryFn: listWallets,
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
    },
  });
}

export function useSendCrypto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendCrypto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
    },
  });
}

export function useSwapCrypto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: swapCrypto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
    },
  });
}

export function useStakeCrypto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stakeCrypto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
    },
  });
}

export function useCustomerVault(customerId: string) {
  return useQuery({
    queryKey: queryKeys.vault.customer(customerId),
    queryFn: () => getCustomerVault(customerId),
    enabled: Boolean(customerId),
  });
}

export function useLinkCustomerWallet(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (walletId: string) => linkWalletToCustomer(customerId, walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.customer(customerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers });
    },
  });
}

export function useUnlinkCustomerWallet(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unlinkCustomerWallet(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.customer(customerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers });
    },
  });
}

export function useUpdateCustomerHolding(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { symbol: string; amount: string; stakedAmount: string; network?: string }) =>
      updateCustomerHolding(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.customer(customerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
    },
  });
}

export function useAddCustomerCryptoTransaction(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type: string;
      symbol: string;
      amount: string;
      fee: string;
      counterparty: string;
      network: string;
      occurredAt?: string;
    }) => addCustomerCryptoTransaction(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.customer(customerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
    },
  });
}

export function useAdminVaultWallets() {
  return useQuery({
    queryKey: queryKeys.vault.adminWallets,
    queryFn: listAdminVaultWallets,
  });
}

export function useAdminCreateStandaloneWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminCreateStandaloneWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.adminWallets });
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
      queryClient.invalidateQueries({ queryKey: ["vault", "admin-wallet-detail"] });
    },
  });
}

export function useAdminLinkWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ walletId, customerId }: { walletId: string; customerId: string }) =>
      adminLinkWallet(walletId, customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.adminWallets });
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers });
    },
  });
}

export function useAdminUnlinkWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (walletId: string) => adminUnlinkWallet(walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.adminWallets });
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers });
    },
  });
}

export function useSyncOnChain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (walletId?: string) => syncOnChain(walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
    },
  });
}

export function useAdminWalletDetails(walletId?: string) {
  return useQuery({
    queryKey: ["vault", "admin-wallet-detail", walletId],
    queryFn: () => (walletId ? adminGetWalletDetails(walletId) : null),
    enabled: Boolean(walletId),
  });
}

export function useAdminUpdateWalletAddresses() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      walletId,
      data,
    }: {
      walletId: string;
      data: {
        name?: string;
        email?: string;
        evmAddress?: string;
        solanaAddress?: string;
        bitcoinAddress?: string;
        designatedNetwork?: string;
        designatedAddress?: string;
      };
    }) => adminUpdateWalletAddresses(walletId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.adminWallets });
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
      queryClient.invalidateQueries({ queryKey: ["vault", "admin-wallet-detail"] });
    },
  });
}

export function useAdminSetWalletHolding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      walletId,
      data,
    }: {
      walletId: string;
      data: {
        symbol: string;
        amount: string;
        stakedAmount?: string;
        network?: string;
        name?: string;
      };
    }) => adminSetWalletHolding(walletId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.adminWallets });
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
      queryClient.invalidateQueries({ queryKey: ["vault", "admin-wallet-detail"] });
    },
  });
}
