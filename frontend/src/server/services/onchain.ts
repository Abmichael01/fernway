import "server-only";
import { createPublicClient, http, formatEther, parseAbi, formatUnits } from "viem";
import { mainnet } from "viem/chains";
import { mnemonicToAccount } from "viem/accounts";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db/client";
import { cryptoWallets, cryptoHoldings } from "@/server/db/schema";

const ERC20_ABI = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
]);

const USDC_MAINNET_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT_MAINNET_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

function getEthereumRpcUrl(): { url: string; providerName: string } {
  const infuraKey = process.env.INFURA_API_KEY;
  if (infuraKey && infuraKey.trim() !== "") {
    return {
      url: `https://mainnet.infura.io/v3/${infuraKey.trim()}`,
      providerName: "Infura Ethereum Mainnet",
    };
  }

  return {
    url: "https://ethereum-rpc.publicnode.com",
    providerName: "Publicnode Ethereum RPC",
  };
}

/**
 * Derives the standard BIP-44 Ethereum address (m/44'/60'/0'/0/0) from a 12 or 24-word recovery phrase,
 * or accepts a direct Ethereum 0x hex address.
 */
export function deriveEvmAddressFromMnemonic(phrase: string): { address: string; isValid: boolean; error?: string } {
  try {
    const cleaned = phrase.trim();
    if (/^0x[a-fA-F0-9]{40}$/i.test(cleaned)) {
      return { address: cleaned, isValid: true };
    }
    const account = mnemonicToAccount(cleaned.toLowerCase());
    return { address: account.address, isValid: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to derive address from mnemonic phrase.";
    return { address: "", isValid: false, error: msg };
  }
}

/**
 * Fetches real, live on-chain balances for an Ethereum address via Infura or public RPC.
 */
export async function fetchLiveOnChainData(address: `0x${string}`): Promise<{
  ethBalance: number;
  usdcBalance: number;
  usdtBalance: number;
  blockNumber: number;
  provider: string;
  syncedAt: string;
} | null> {
  const { url, providerName } = getEthereumRpcUrl();

  const client = createPublicClient({
    chain: mainnet,
    transport: http(url, {
      timeout: 10_000,
      retryCount: 2,
    }),
  });

  try {
    const [rawEthBalance, rawBlockNumber] = await Promise.all([
      client.getBalance({ address }),
      client.getBlockNumber(),
    ]);

    let usdcBalance = 0;
    let usdtBalance = 0;

    try {
      const rawUsdc = await client.readContract({
        address: USDC_MAINNET_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });
      usdcBalance = parseFloat(formatUnits(rawUsdc, 6));
    } catch {
      // Token balance query failed (non-critical)
    }

    try {
      const rawUsdt = await client.readContract({
        address: USDT_MAINNET_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });
      usdtBalance = parseFloat(formatUnits(rawUsdt, 6));
    } catch {
      // Token balance query failed (non-critical)
    }

    const ethBalance = parseFloat(formatEther(rawEthBalance));

    return {
      ethBalance,
      usdcBalance,
      usdtBalance,
      blockNumber: Number(rawBlockNumber),
      provider: providerName,
      syncedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[OnChain] Failed to fetch live balance from RPC:", err);
    return null;
  }
}

/**
 * Synchronizes a wallet's database holdings with real live on-chain balances.
 */
export async function syncWalletOnChain(walletId: string): Promise<{
  success: boolean;
  ethBalance: number;
  usdcBalance: number;
  usdtBalance: number;
  blockNumber: number;
  provider: string;
  syncedAt: string;
}> {
  const wallet = await db().query.cryptoWallets.findFirst({
    where: eq(cryptoWallets.id, walletId),
  });

  if (!wallet) {
    throw new Error("Wallet not found.");
  }

  const live = await fetchLiveOnChainData(wallet.evmAddress as `0x${string}`);

  if (!live) {
    throw new Error("Could not reach Ethereum RPC. Check network connectivity or Infura API key.");
  }

  // Update or insert ETH holding
  const existingEth = await db().query.cryptoHoldings.findFirst({
    where: and(eq(cryptoHoldings.walletId, walletId), eq(cryptoHoldings.symbol, "ETH")),
  });

  if (existingEth) {
    // If on-chain balance is > 0, reflect the real on-chain balance!
    // If on-chain is 0 and it was a newly imported wallet, update to real 0.
    await db()
      .update(cryptoHoldings)
      .set({ amount: live.ethBalance.toFixed(6) })
      .where(eq(cryptoHoldings.id, existingEth.id));
  } else {
    await db().insert(cryptoHoldings).values({
      walletId,
      symbol: "ETH",
      name: "Ethereum",
      network: "Ethereum",
      amount: live.ethBalance.toFixed(6),
      stakedAmount: "0",
    });
  }

  // Update or insert USDC holding
  const existingUsdc = await db().query.cryptoHoldings.findFirst({
    where: and(eq(cryptoHoldings.walletId, walletId), eq(cryptoHoldings.symbol, "USDC")),
  });

  if (existingUsdc) {
    await db()
      .update(cryptoHoldings)
      .set({ amount: live.usdcBalance.toFixed(2) })
      .where(eq(cryptoHoldings.id, existingUsdc.id));
  } else {
    await db().insert(cryptoHoldings).values({
      walletId,
      symbol: "USDC",
      name: "USD Coin",
      network: "Ethereum",
      amount: live.usdcBalance.toFixed(2),
      stakedAmount: "0",
    });
  }

  // Update or insert USDT holding
  const existingUsdt = await db().query.cryptoHoldings.findFirst({
    where: and(eq(cryptoHoldings.walletId, walletId), eq(cryptoHoldings.symbol, "USDT")),
  });

  if (existingUsdt) {
    await db()
      .update(cryptoHoldings)
      .set({ amount: live.usdtBalance.toFixed(2) })
      .where(eq(cryptoHoldings.id, existingUsdt.id));
  } else {
    await db().insert(cryptoHoldings).values({
      walletId,
      symbol: "USDT",
      name: "Tether USD",
      network: "Ethereum",
      amount: live.usdtBalance.toFixed(2),
      stakedAmount: "0",
    });
  }

  return {
    success: true,
    ethBalance: live.ethBalance,
    usdcBalance: live.usdcBalance,
    usdtBalance: live.usdtBalance,
    blockNumber: live.blockNumber,
    provider: live.provider,
    syncedAt: live.syncedAt,
  };
}
