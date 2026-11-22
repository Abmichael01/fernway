import type { Metadata } from "next";
import { WithdrawView } from "@/components/invest/withdraw/withdraw-view";

export const metadata: Metadata = { title: "Withdraw" };

export default function Page() {
  return <WithdrawView />;
}
