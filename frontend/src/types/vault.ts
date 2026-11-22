export type CryptoNetwork =
  | "All Networks"
  | "Ethereum"
  | "Solana"
  | "Bitcoin"
  | "BNB Smart Chain"
  | "Polygon"
  | "Arbitrum"
  | "Base"
  | "Avalanche";

export interface VaultWallet {
  id: string;
  userId: string | null;
  email?: string | null;
  name: string;
  evmAddress: string;
  solanaAddress: string;
  bitcoinAddress: string;
  designatedNetwork?: string;
  designatedAddress?: string | null;
  createdAt: string;
  linkedCustomerName?: string | null;
  linkedCustomerEmail?: string | null;
}

export interface VaultHolding {
  id: string;
  walletId: string;
  symbol: string;
  name: string;
  network: string;
  amount: number;
  stakedAmount: number;
  price: number;
  change24h: number;
  valueUsd: number;
  sparkline: number[];
}

export type VaultTxType = "send" | "receive" | "swap" | "stake" | "unstake" | "claim";

export interface VaultTransaction {
  id: string;
  walletId: string;
  type: VaultTxType;
  symbol: string;
  amount: string;
  fee: string;
  counterparty: string;
  txHash: string;
  network: string;
  status: "completed" | "pending" | "failed";
  occurredAt: string;
}

export interface VaultNft {
  id: string;
  walletId: string;
  name: string;
  collection: string;
  tokenId: string;
  imageUrl: string;
  network: string;
  floorPrice: string;
  estimatedUsd: number;
}

export interface VaultStakingOption {
  symbol: string;
  name: string;
  network: string;
  apyPercent: number;
  lockupDays: number;
  minAmount: number;
  validator: string;
}

export interface OnChainSyncStatus {
  connected: boolean;
  provider: string;
  blockNumber?: number;
  lastSyncedAt?: string;
  isRealAddress?: boolean;
}

export interface VaultOverview {
  wallet: VaultWallet | null;
  holdings: VaultHolding[];
  transactions: VaultTransaction[];
  nfts: VaultNft[];
  totalValueUsd: number;
  change24hUsd: number;
  change24hPercent: number;
  totalStakedUsd: number;
  isLinked?: boolean;
  onChainStatus?: OnChainSyncStatus;
}

export interface AdminVaultWalletItem {
  id: string;
  userId: string | null;
  email: string | null;
  name: string;
  evmAddress: string;
  solanaAddress: string;
  bitcoinAddress: string;
  designatedNetwork?: string;
  designatedAddress?: string | null;
  totalValueUsd: number;
  totalStakedUsd: number;
  holdingsCount: number;
  nftsCount: number;
  createdAt: string;
  linkedCustomer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}
