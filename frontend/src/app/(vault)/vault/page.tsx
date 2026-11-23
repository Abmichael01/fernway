import type { Metadata } from "next";
import { VaultView } from "@/components/vault/vault-view";

export const metadata: Metadata = {
  title: "Lindenway Vault — Self-Custody Multi-Chain Crypto Platform",
  description: "Next-gen multi-chain self-custody wallet, cross-chain swaps, staking, and Web3 gateway.",
  robots: { index: false, follow: false },
};

export const instant = false;

export default function VaultPage() {
  return <VaultView />;
}
