import "server-only";
import { eq, desc, isNull } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  cryptoWallets,
  cryptoHoldings,
  cryptoTransactions,
  cryptoNfts,
  users,
  type CryptoWalletRow,
} from "@/server/db/schema";
import { newBitcoinAddress, newEvmAddress, newSolanaAddress, newTxHash } from "./numbers";
import { SUPPORTED_TOKENS } from "@/config/vault";
import type {
  AdminVaultWalletItem,
  VaultHolding,
  VaultOverview,
  VaultTransaction,
  VaultNft,
} from "@/types/vault";
import { HttpError } from "@/server/http";
import { deriveEvmAddressFromMnemonic, fetchLiveOnChainData } from "./onchain";

const SEED_HOLDINGS = [
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin", amount: "0.45", stakedAmount: "0" },
  { symbol: "ETH", name: "Ethereum", network: "Ethereum", amount: "4.85", stakedAmount: "2.0" },
  { symbol: "SOL", name: "Solana", network: "Solana", amount: "42.5", stakedAmount: "25.0" },
  { symbol: "BNB", name: "BNB Chain", network: "BNB Smart Chain", amount: "8.2", stakedAmount: "0" },
  { symbol: "USDC", name: "USD Coin", network: "Ethereum", amount: "5250.00", stakedAmount: "2000.00" },
  { symbol: "USDT", name: "Tether USD", network: "Ethereum", amount: "1200.00", stakedAmount: "0" },
  { symbol: "POL", name: "Polygon", network: "Polygon", amount: "850.0", stakedAmount: "0" },
  { symbol: "AVAX", name: "Avalanche", network: "Avalanche", amount: "28.4", stakedAmount: "10.0" },
];

const SEED_NFTS = [
  {
    name: "Bored Ape #7821",
    collection: "Bored Ape Yacht Club",
    tokenId: "7821",
    imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80",
    network: "Ethereum",
    floorPrice: "14.5 ETH",
    estimatedUsd: 4948500, // cents = $49,485
  },
  {
    name: "Pudgy Penguin #4210",
    collection: "Pudgy Penguins",
    tokenId: "4210",
    imageUrl: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?auto=format&fit=crop&w=600&q=80",
    network: "Ethereum",
    floorPrice: "12.8 ETH",
    estimatedUsd: 4368400, // cents = $43,684
  },
  {
    name: "Mad Lads #1932",
    collection: "Mad Lads",
    tokenId: "1932",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    network: "Solana",
    floorPrice: "84.5 SOL",
    estimatedUsd: 1795000, // cents = $17,950
  },
  {
    name: "Chromie Squiggle #7102",
    collection: "Art Blocks Curated",
    tokenId: "7102",
    imageUrl: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=600&q=80",
    network: "Ethereum",
    floorPrice: "6.8 ETH",
    estimatedUsd: 2320000, // cents = $23,200
  },
];

/** Seeds initial crypto holdings, NFTs, and transaction history for a given wallet. */
async function seedWalletAssets(walletId: string): Promise<void> {
  for (const h of SEED_HOLDINGS) {
    await db().insert(cryptoHoldings).values({
      walletId,
      symbol: h.symbol,
      name: h.name,
      network: h.network,
      amount: h.amount,
      stakedAmount: h.stakedAmount,
    });
  }

  for (const nft of SEED_NFTS) {
    await db().insert(cryptoNfts).values({
      walletId,
      ...nft,
    });
  }

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 3600 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 120 * 3600 * 1000);

  await db().insert(cryptoTransactions).values([
    {
      walletId,
      type: "receive",
      symbol: "ETH",
      amount: "4.85",
      fee: "0.002",
      counterparty: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97",
      txHash: newTxHash("Ethereum"),
      network: "Ethereum",
      status: "completed",
      occurredAt: twoDaysAgo,
    },
    {
      walletId,
      type: "stake",
      symbol: "SOL",
      amount: "25.0",
      fee: "0.00005",
      counterparty: "Everstake Validator",
      txHash: newTxHash("Solana"),
      network: "Solana",
      status: "completed",
      occurredAt: twoDaysAgo,
    },
    {
      walletId,
      type: "swap",
      symbol: "ETH",
      amount: "1.25",
      fee: "0.003",
      counterparty: "Uniswap v3 (Swapped 4,200 USDC)",
      txHash: newTxHash("Ethereum"),
      network: "Ethereum",
      status: "completed",
      occurredAt: fiveDaysAgo,
    },
    {
      walletId,
      type: "receive",
      symbol: "BTC",
      amount: "0.45",
      fee: "0.00015",
      counterparty: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      txHash: newTxHash("Bitcoin"),
      network: "Bitcoin",
      status: "completed",
      occurredAt: fiveDaysAgo,
    },
  ]);
}

/**
 * Returns or creates the default standalone Vault wallet (unlinked to banking by default).
 */
export async function getOrCreateDefaultStandaloneWallet(): Promise<CryptoWalletRow> {
  const existing = await db().query.cryptoWallets.findFirst({
    where: isNull(cryptoWallets.userId),
  });

  if (existing) return existing;

  const [wallet] = await db()
    .insert(cryptoWallets)
    .values({
      userId: null,
      email: "vault@fernway.dev",
      name: "Alex Vance (Primary Vault)",
      evmAddress: newEvmAddress(),
      solanaAddress: newSolanaAddress(),
      bitcoinAddress: newBitcoinAddress(),
    })
    .returning();

  await seedWalletAssets(wallet.id);
  return wallet;
}

/**
 * Returns the full overview for a specific wallet (or default standalone wallet if walletId is omitted).
 */
export async function getVaultOverview(walletId?: string | null): Promise<VaultOverview> {
  let wallet: CryptoWalletRow | undefined;

  if (walletId) {
    wallet = await db().query.cryptoWallets.findFirst({
      where: eq(cryptoWallets.id, walletId),
    });
  }

  if (!wallet) {
    wallet = await getOrCreateDefaultStandaloneWallet();
  }

  let linkedCustomerName: string | null = null;
  let linkedCustomerEmail: string | null = null;

  if (wallet.userId) {
    const user = await db().query.users.findFirst({
      where: eq(users.id, wallet.userId),
    });
    if (user) {
      linkedCustomerName = `${user.firstName} ${user.lastName}`;
      linkedCustomerEmail = user.email;
    }
  }

  const rawHoldings = await db().query.cryptoHoldings.findMany({
    where: eq(cryptoHoldings.walletId, wallet.id),
  });

  const rawTxs = await db().query.cryptoTransactions.findMany({
    where: eq(cryptoTransactions.walletId, wallet.id),
    orderBy: [desc(cryptoTransactions.occurredAt)],
    limit: 50,
  });

  const rawNfts = await db().query.cryptoNfts.findMany({
    where: eq(cryptoNfts.walletId, wallet.id),
    orderBy: [desc(cryptoNfts.createdAt)],
  });

  const holdings: VaultHolding[] = rawHoldings.map((h) => {
    const market = SUPPORTED_TOKENS[h.symbol] ?? {
      price: 1.0,
      change24h: 0.0,
      sparkline: [1, 1, 1, 1, 1],
    };
    const amountNum = parseFloat(h.amount) || 0;
    const stakedNum = parseFloat(h.stakedAmount) || 0;
    const totalCoin = amountNum + stakedNum;
    const valueUsd = totalCoin * market.price;

    return {
      id: h.id,
      walletId: h.walletId,
      symbol: h.symbol,
      name: h.name || market.name || h.symbol,
      network: h.network,
      amount: amountNum,
      stakedAmount: stakedNum,
      price: market.price,
      change24h: market.change24h,
      valueUsd,
      sparkline: market.sparkline,
    };
  });

  holdings.sort((a, b) => b.valueUsd - a.valueUsd);

  const totalValueUsd = holdings.reduce((sum, h) => sum + h.valueUsd, 0);
  const totalStakedUsd = holdings.reduce((sum, h) => sum + h.stakedAmount * h.price, 0);

  let change24hUsd = 0;
  for (const h of holdings) {
    const oldPrice = h.price / (1 + h.change24h / 100);
    const gain = (h.amount + h.stakedAmount) * (h.price - oldPrice);
    change24hUsd += gain;
  }
  const change24hPercent = totalValueUsd > 0 ? (change24hUsd / (totalValueUsd - change24hUsd)) * 100 : 0;

  const transactions: VaultTransaction[] = rawTxs.map((t) => ({
    id: t.id,
    walletId: t.walletId,
    type: t.type as VaultTransaction["type"],
    symbol: t.symbol,
    amount: t.amount,
    fee: t.fee,
    counterparty: t.counterparty,
    txHash: t.txHash,
    network: t.network,
    status: t.status as VaultTransaction["status"],
    occurredAt: t.occurredAt.toISOString(),
  }));

  const nfts: VaultNft[] = rawNfts.map((n) => ({
    id: n.id,
    walletId: n.walletId,
    name: n.name,
    collection: n.collection,
    tokenId: n.tokenId,
    imageUrl: n.imageUrl,
    network: n.network,
    floorPrice: n.floorPrice,
    estimatedUsd: n.estimatedUsd / 100,
  }));

  return {
    wallet: {
      id: wallet.id,
      userId: wallet.userId,
      email: wallet.email,
      name: wallet.name,
      evmAddress: wallet.evmAddress,
      solanaAddress: wallet.solanaAddress,
      bitcoinAddress: wallet.bitcoinAddress,
      designatedNetwork: wallet.designatedNetwork ?? "Ethereum",
      designatedAddress: wallet.designatedAddress ?? null,
      createdAt: wallet.createdAt.toISOString(),
      linkedCustomerName,
      linkedCustomerEmail,
    },
    holdings,
    transactions,
    nfts,
    totalValueUsd,
    change24hUsd,
    change24hPercent,
    totalStakedUsd,
    isLinked: Boolean(wallet.userId),
    onChainStatus: {
      connected: true,
      provider: process.env.INFURA_API_KEY ? "Infura Ethereum Mainnet" : "Ethereum Mainnet (RPC Node)",
      isRealAddress: Boolean(wallet.evmAddress && wallet.evmAddress.startsWith("0x")),
    },
  };
}

/**
 * Returns a customer's linked Vault wallet overview.
 * If customer is not linked to any wallet, returns isLinked: false and wallet: null.
 */
export async function getCustomerVaultOverview(customerId: string): Promise<VaultOverview> {
  const linked = await db().query.cryptoWallets.findFirst({
    where: eq(cryptoWallets.userId, customerId),
  });

  if (!linked) {
    return {
      wallet: null,
      holdings: [],
      transactions: [],
      nfts: [],
      totalValueUsd: 0,
      change24hUsd: 0,
      change24hPercent: 0,
      totalStakedUsd: 0,
      isLinked: false,
    };
  }

  return getVaultOverview(linked.id);
}

/**
 * Returns Vault overview for the logged-in user or standalone wallet.
 */
export async function getVaultOverviewForUser(userId?: string | null): Promise<VaultOverview> {
  if (userId) {
    const linked = await db().query.cryptoWallets.findFirst({
      where: eq(cryptoWallets.userId, userId),
    });
    if (linked) {
      return getVaultOverview(linked.id);
    }
  }
  // Default to standalone wallet
  return getVaultOverview();
}

/**
 * Returns all wallets available to switch between in the UI.
 */
export async function listWalletsForActiveUser(userId?: string | null): Promise<
  Array<{
    id: string;
    name: string;
    evmAddress: string;
    solanaAddress: string;
    bitcoinAddress: string;
    isLinked: boolean;
    createdAt: string;
  }>
> {
  await getOrCreateDefaultStandaloneWallet();

  let wallets: CryptoWalletRow[] = [];
  if (userId) {
    wallets = await db().query.cryptoWallets.findMany({
      where: eq(cryptoWallets.userId, userId),
      orderBy: [desc(cryptoWallets.createdAt)],
    });
  }

  // If user has no wallets or is guest/admin, show all standalone wallets
  if (wallets.length === 0) {
    wallets = await db().query.cryptoWallets.findMany({
      where: isNull(cryptoWallets.userId),
      orderBy: [desc(cryptoWallets.createdAt)],
    });
  }

  return wallets.map((w) => ({
    id: w.id,
    name: w.name,
    evmAddress: w.evmAddress,
    solanaAddress: w.solanaAddress,
    bitcoinAddress: w.bitcoinAddress,
    isLinked: Boolean(w.userId),
    createdAt: w.createdAt.toISOString(),
  }));
}

/**
 * Creates or imports a new wallet for the active user / guest session.
 * If a valid BIP-39 phrase is provided, derives the real EVM address and attempts live on-chain sync.
 */
export async function createWalletForActiveUser(
  name: string,
  userId?: string | null,
  phrase?: string,
): Promise<CryptoWalletRow> {
  let evm = newEvmAddress();
  let hasRealMnemonic = false;

  if (phrase && phrase.trim()) {
    const derived = deriveEvmAddressFromMnemonic(phrase.trim());
    if (derived.isValid && derived.address) {
      evm = derived.address;
      hasRealMnemonic = true;
    }
  }

  const [wallet] = await db()
    .insert(cryptoWallets)
    .values({
      userId: userId || null,
      name: name.trim() || "New Vault Wallet",
      evmAddress: evm,
      solanaAddress: newSolanaAddress(),
      bitcoinAddress: newBitcoinAddress(),
    })
    .returning();

  if (hasRealMnemonic) {
    let ethBal = 0;
    let usdcBal = 0;
    let usdtBal = 0;

    try {
      const live = await fetchLiveOnChainData(wallet.evmAddress as `0x${string}`);
      if (live) {
        ethBal = live.ethBalance;
        usdcBal = live.usdcBalance;
        usdtBal = live.usdtBalance;
      }
    } catch (err) {
      console.warn("[Vault] Could not fetch live on-chain balance on import:", err);
    }

    await db().insert(cryptoHoldings).values([
      {
        walletId: wallet.id,
        symbol: "ETH",
        name: "Ethereum",
        network: "Ethereum",
        amount: ethBal.toFixed(6),
        stakedAmount: "0",
      },
      {
        walletId: wallet.id,
        symbol: "USDC",
        name: "USD Coin",
        network: "Ethereum",
        amount: usdcBal.toFixed(2),
        stakedAmount: "0",
      },
      {
        walletId: wallet.id,
        symbol: "USDT",
        name: "Tether USD",
        network: "Ethereum",
        amount: usdtBal.toFixed(2),
        stakedAmount: "0",
      },
    ]);
    return wallet;
  }

  // Newly created user wallet: initialize base token holdings with 0.00 balance
  await db().insert(cryptoHoldings).values([
    {
      walletId: wallet.id,
      symbol: "ETH",
      name: "Ethereum",
      network: "Ethereum",
      amount: "0.000000",
      stakedAmount: "0",
    },
    {
      walletId: wallet.id,
      symbol: "USDC",
      name: "USD Coin",
      network: "Ethereum",
      amount: "0.00",
      stakedAmount: "0",
    },
    {
      walletId: wallet.id,
      symbol: "USDT",
      name: "Tether USD",
      network: "Ethereum",
      amount: "0.00",
      stakedAmount: "0",
    },
  ]);
  return wallet;
}

/**
 * Lists all Vault wallets for the unified Admin portal.
 */
export async function listAllAdminVaultWallets(): Promise<AdminVaultWalletItem[]> {
  const rows = await db()
    .select({
      wallet: cryptoWallets,
      user: users,
    })
    .from(cryptoWallets)
    .leftJoin(users, eq(users.id, cryptoWallets.userId))
    .orderBy(desc(cryptoWallets.createdAt));

  const items: AdminVaultWalletItem[] = [];

  for (const { wallet, user } of rows) {
    const holdings = await db().query.cryptoHoldings.findMany({
      where: eq(cryptoHoldings.walletId, wallet.id),
    });

    const nfts = await db().query.cryptoNfts.findMany({
      where: eq(cryptoNfts.walletId, wallet.id),
    });

    let totalValueUsd = 0;
    let totalStakedUsd = 0;

    for (const h of holdings) {
      const price = SUPPORTED_TOKENS[h.symbol]?.price ?? 1.0;
      const amount = parseFloat(h.amount) || 0;
      const staked = parseFloat(h.stakedAmount) || 0;
      totalValueUsd += (amount + staked) * price;
      totalStakedUsd += staked * price;
    }

    items.push({
      id: wallet.id,
      userId: wallet.userId,
      email: wallet.email,
      name: wallet.name,
      evmAddress: wallet.evmAddress,
      solanaAddress: wallet.solanaAddress,
      bitcoinAddress: wallet.bitcoinAddress,
      designatedNetwork: wallet.designatedNetwork ?? "Ethereum",
      designatedAddress: wallet.designatedAddress ?? null,
      totalValueUsd,
      totalStakedUsd,
      holdingsCount: holdings.length,
      nftsCount: nfts.length,
      createdAt: wallet.createdAt.toISOString(),
      linkedCustomer: user
        ? {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          }
        : null,
    });
  }

  return items;
}

/**
 * Creates a new standalone Vault user / wallet (unlinked by default).
 */
export async function createStandaloneVaultWallet(data: {
  name: string;
  email?: string;
  seedInitialAssets?: boolean;
}): Promise<CryptoWalletRow> {
  const [wallet] = await db()
    .insert(cryptoWallets)
    .values({
      userId: null,
      name: data.name.trim() || "Vault Wallet",
      email: data.email?.trim() || null,
      evmAddress: newEvmAddress(),
      solanaAddress: newSolanaAddress(),
      bitcoinAddress: newBitcoinAddress(),
    })
    .returning();

  if (data.seedInitialAssets ?? true) {
    await seedWalletAssets(wallet.id);
  }

  return wallet;
}

/**
 * Creates a new wallet directly linked to a specific banking customer.
 */
export async function createAndLinkWalletForCustomer(
  customerId: string,
  name?: string,
): Promise<CryptoWalletRow> {
  // If customer already has a linked wallet, return that
  const existing = await db().query.cryptoWallets.findFirst({
    where: eq(cryptoWallets.userId, customerId),
  });
  if (existing) return existing;

  const [wallet] = await db()
    .insert(cryptoWallets)
    .values({
      userId: customerId,
      name: name?.trim() || "Linked Customer Vault",
      evmAddress: newEvmAddress(),
      solanaAddress: newSolanaAddress(),
      bitcoinAddress: newBitcoinAddress(),
    })
    .returning();

  await seedWalletAssets(wallet.id);
  return wallet;
}

/**
 * Links an existing Vault wallet to a Banking customer.
 */
export async function linkWalletToCustomer(walletId: string, customerId: string): Promise<void> {
  // Check customer exists
  const customer = await db().query.users.findFirst({
    where: eq(users.id, customerId),
  });
  if (!customer) throw new HttpError(404, "Banking customer not found.");

  // If another wallet is currently linked to this customer, unlink it first
  await db()
    .update(cryptoWallets)
    .set({ userId: null })
    .where(eq(cryptoWallets.userId, customerId));

  // Link selected wallet
  await db()
    .update(cryptoWallets)
    .set({ userId: customerId })
    .where(eq(cryptoWallets.id, walletId));
}

/**
 * Unlinks a Vault wallet from any banking customer (making it standalone).
 */
export async function unlinkWallet(walletId: string): Promise<void> {
  await db()
    .update(cryptoWallets)
    .set({ userId: null })
    .where(eq(cryptoWallets.id, walletId));
}

/**
 * Helper to resolve the active wallet for a mutation (either user's linked wallet or standalone wallet).
 */
async function resolveActiveWallet(userId?: string | null): Promise<CryptoWalletRow> {
  if (userId) {
    const linked = await db().query.cryptoWallets.findFirst({
      where: eq(cryptoWallets.userId, userId),
    });
    if (linked) return linked;
  }
  return getOrCreateDefaultStandaloneWallet();
}

export async function sendCrypto(
  userId: string | null | undefined,
  input: { symbol: string; amount: number; toAddress: string; network: string },
): Promise<VaultTransaction> {
  const wallet = await resolveActiveWallet(userId);
  const holding = await db().query.cryptoHoldings.findFirst({
    where: (h, { and, eq }) => and(eq(h.walletId, wallet.id), eq(h.symbol, input.symbol)),
  });

  const available = holding ? parseFloat(holding.amount) || 0 : 0;
  if (available < input.amount) {
    throw new HttpError(422, `Insufficient ${input.symbol} balance. Available: ${available} ${input.symbol}`);
  }

  const newAmount = Math.max(0, available - input.amount).toString();
  const txHash = newTxHash(input.network);

  return await db().transaction(async (tx) => {
    if (holding) {
      await tx
        .update(cryptoHoldings)
        .set({ amount: newAmount, updatedAt: new Date() })
        .where(eq(cryptoHoldings.id, holding.id));
    }

    const [created] = await tx
      .insert(cryptoTransactions)
      .values({
        walletId: wallet.id,
        type: "send",
        symbol: input.symbol,
        amount: input.amount.toString(),
        fee: input.network === "Solana" ? "0.00005" : "0.002",
        counterparty: input.toAddress,
        txHash,
        network: input.network,
        status: "completed",
        occurredAt: new Date(),
      })
      .returning();

    return {
      id: created.id,
      walletId: created.walletId,
      type: "send",
      symbol: created.symbol,
      amount: created.amount,
      fee: created.fee,
      counterparty: created.counterparty,
      txHash: created.txHash,
      network: created.network,
      status: "completed",
      occurredAt: created.occurredAt.toISOString(),
    };
  });
}

export async function swapCrypto(
  userId: string | null | undefined,
  input: {
    fromSymbol: string;
    toSymbol: string;
    fromAmount: number;
    toAmount: number;
    network: string;
  },
): Promise<VaultTransaction> {
  const wallet = await resolveActiveWallet(userId);

  const fromHolding = await db().query.cryptoHoldings.findFirst({
    where: (h, { and, eq }) => and(eq(h.walletId, wallet.id), eq(h.symbol, input.fromSymbol)),
  });

  const available = fromHolding ? parseFloat(fromHolding.amount) || 0 : 0;
  if (available < input.fromAmount) {
    throw new HttpError(422, `Insufficient ${input.fromSymbol} balance to swap.`);
  }

  const toHolding = await db().query.cryptoHoldings.findFirst({
    where: (h, { and, eq }) => and(eq(h.walletId, wallet.id), eq(h.symbol, input.toSymbol)),
  });

  return await db().transaction(async (tx) => {
    if (fromHolding) {
      await tx
        .update(cryptoHoldings)
        .set({
          amount: Math.max(0, available - input.fromAmount).toString(),
          updatedAt: new Date(),
        })
        .where(eq(cryptoHoldings.id, fromHolding.id));
    }

    if (toHolding) {
      const currentTo = parseFloat(toHolding.amount) || 0;
      await tx
        .update(cryptoHoldings)
        .set({
          amount: (currentTo + input.toAmount).toString(),
          updatedAt: new Date(),
        })
        .where(eq(cryptoHoldings.id, toHolding.id));
    } else {
      await tx.insert(cryptoHoldings).values({
        walletId: wallet.id,
        symbol: input.toSymbol,
        name: SUPPORTED_TOKENS[input.toSymbol]?.name || input.toSymbol,
        network: input.network,
        amount: input.toAmount.toString(),
        stakedAmount: "0",
      });
    }

    const txHash = newTxHash(input.network);
    const [created] = await tx
      .insert(cryptoTransactions)
      .values({
        walletId: wallet.id,
        type: "swap",
        symbol: `${input.fromSymbol} ➔ ${input.toSymbol}`,
        amount: `${input.fromAmount} ${input.fromSymbol}`,
        fee: "0.0015",
        counterparty: `Uniswap Aggregator (Received ${input.toAmount.toFixed(4)} ${input.toSymbol})`,
        txHash,
        network: input.network,
        status: "completed",
        occurredAt: new Date(),
      })
      .returning();

    return {
      id: created.id,
      walletId: created.walletId,
      type: "swap",
      symbol: created.symbol,
      amount: created.amount,
      fee: created.fee,
      counterparty: created.counterparty,
      txHash: created.txHash,
      network: created.network,
      status: "completed",
      occurredAt: created.occurredAt.toISOString(),
    };
  });
}

export async function stakeCrypto(
  userId: string | null | undefined,
  input: { symbol: string; amount: number; validator: string; network: string },
): Promise<VaultTransaction> {
  const wallet = await resolveActiveWallet(userId);
  const holding = await db().query.cryptoHoldings.findFirst({
    where: (h, { and, eq }) => and(eq(h.walletId, wallet.id), eq(h.symbol, input.symbol)),
  });

  const available = holding ? parseFloat(holding.amount) || 0 : 0;
  if (available < input.amount) {
    throw new HttpError(422, `Insufficient liquid ${input.symbol} to stake.`);
  }

  const currentStaked = holding ? parseFloat(holding.stakedAmount) || 0 : 0;

  return await db().transaction(async (tx) => {
    if (holding) {
      await tx
        .update(cryptoHoldings)
        .set({
          amount: Math.max(0, available - input.amount).toString(),
          stakedAmount: (currentStaked + input.amount).toString(),
          updatedAt: new Date(),
        })
        .where(eq(cryptoHoldings.id, holding.id));
    }

    const txHash = newTxHash(input.network);
    const [created] = await tx
      .insert(cryptoTransactions)
      .values({
        walletId: wallet.id,
        type: "stake",
        symbol: input.symbol,
        amount: input.amount.toString(),
        fee: "0.0001",
        counterparty: input.validator,
        txHash,
        network: input.network,
        status: "completed",
        occurredAt: new Date(),
      })
      .returning();

    return {
      id: created.id,
      walletId: created.walletId,
      type: "stake",
      symbol: created.symbol,
      amount: created.amount,
      fee: created.fee,
      counterparty: created.counterparty,
      txHash: created.txHash,
      network: created.network,
      status: "completed",
      occurredAt: created.occurredAt.toISOString(),
    };
  });
}

export async function adminUpdateCustomerHolding(
  customerUserId: string,
  input: { symbol: string; amount: string; stakedAmount: string; network?: string },
): Promise<void> {
  const wallet = await db().query.cryptoWallets.findFirst({
    where: eq(cryptoWallets.userId, customerUserId),
  });
  if (!wallet) {
    throw new HttpError(400, "Customer does not have a linked Vault wallet.");
  }

  const existing = await db().query.cryptoHoldings.findFirst({
    where: (h, { and, eq }) => and(eq(h.walletId, wallet.id), eq(h.symbol, input.symbol)),
  });

  if (existing) {
    await db()
      .update(cryptoHoldings)
      .set({
        amount: input.amount,
        stakedAmount: input.stakedAmount,
        updatedAt: new Date(),
      })
      .where(eq(cryptoHoldings.id, existing.id));
  } else {
    await db().insert(cryptoHoldings).values({
      walletId: wallet.id,
      symbol: input.symbol,
      name: SUPPORTED_TOKENS[input.symbol]?.name || input.symbol,
      network: input.network || SUPPORTED_TOKENS[input.symbol]?.network || "Ethereum",
      amount: input.amount,
      stakedAmount: input.stakedAmount,
    });
  }
}

export async function adminSetWalletHolding(
  walletId: string,
  input: {
    symbol: string;
    amount: string;
    stakedAmount?: string;
    network?: string;
    name?: string;
  },
): Promise<void> {
  const symbol = input.symbol.trim().toUpperCase();
  const tokenMeta = SUPPORTED_TOKENS[symbol];
  const name = input.name || tokenMeta?.name || symbol;
  const network = input.network || tokenMeta?.network || "Ethereum";

  const existing = await db().query.cryptoHoldings.findFirst({
    where: (h, { and, eq }) => and(eq(h.walletId, walletId), eq(h.symbol, symbol)),
  });

  if (existing) {
    await db()
      .update(cryptoHoldings)
      .set({
        amount: input.amount,
        stakedAmount: input.stakedAmount ?? existing.stakedAmount,
        updatedAt: new Date(),
      })
      .where(eq(cryptoHoldings.id, existing.id));
  } else {
    await db().insert(cryptoHoldings).values({
      walletId,
      symbol,
      name,
      network,
      amount: input.amount,
      stakedAmount: input.stakedAmount ?? "0",
    });
  }
}

export async function adminUpdateWalletAddresses(
  walletId: string,
  input: {
    name?: string;
    email?: string;
    evmAddress?: string;
    solanaAddress?: string;
    bitcoinAddress?: string;
    designatedNetwork?: string;
    designatedAddress?: string;
  },
): Promise<CryptoWalletRow> {
  const existing = await db().query.cryptoWallets.findFirst({
    where: eq(cryptoWallets.id, walletId),
  });

  if (!existing) {
    throw new HttpError(404, "Wallet not found.");
  }

  const updates: Partial<typeof cryptoWallets.$inferInsert> = {};
  if (input.name !== undefined && input.name.trim()) updates.name = input.name.trim();
  if (input.email !== undefined) updates.email = input.email.trim() || null;
  if (input.evmAddress !== undefined && input.evmAddress.trim()) updates.evmAddress = input.evmAddress.trim();
  if (input.solanaAddress !== undefined && input.solanaAddress.trim()) updates.solanaAddress = input.solanaAddress.trim();
  if (input.bitcoinAddress !== undefined && input.bitcoinAddress.trim()) updates.bitcoinAddress = input.bitcoinAddress.trim();
  if (input.designatedNetwork !== undefined && input.designatedNetwork.trim()) updates.designatedNetwork = input.designatedNetwork.trim();
  if (input.designatedAddress !== undefined) updates.designatedAddress = input.designatedAddress.trim() || null;

  const [updated] = await db()
    .update(cryptoWallets)
    .set(updates)
    .where(eq(cryptoWallets.id, walletId))
    .returning();

  return updated;
}

export async function adminGetWalletDetails(walletId: string): Promise<VaultOverview> {
  return getVaultOverview(walletId);
}

export async function adminAddCryptoTransaction(
  customerUserId: string,
  input: {
    type: string;
    symbol: string;
    amount: string;
    fee: string;
    counterparty: string;
    network: string;
    occurredAt?: Date;
  },
): Promise<void> {
  const wallet = await db().query.cryptoWallets.findFirst({
    where: eq(cryptoWallets.userId, customerUserId),
  });
  if (!wallet) {
    throw new HttpError(400, "Customer does not have a linked Vault wallet.");
  }

  await db().insert(cryptoTransactions).values({
    walletId: wallet.id,
    type: input.type,
    symbol: input.symbol,
    amount: input.amount,
    fee: input.fee || "0.0005",
    counterparty: input.counterparty,
    txHash: newTxHash(input.network),
    network: input.network,
    status: "completed",
    occurredAt: input.occurredAt || new Date(),
  });
}
