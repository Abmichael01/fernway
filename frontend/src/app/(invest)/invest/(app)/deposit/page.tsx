import type { Metadata } from "next";
import { DepositView } from "@/components/invest/deposit/deposit-view";

export const metadata: Metadata = { title: "Deposit" };

export default function Page() {
  return <DepositView />;
}
