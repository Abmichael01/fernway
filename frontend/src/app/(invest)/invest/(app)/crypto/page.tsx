import type { Metadata } from "next";
import { CryptoMarket } from "@/components/invest/crypto/crypto-market";

export const metadata: Metadata = { title: "Crypto" };

export default function Page() {
  return <CryptoMarket />;
}
