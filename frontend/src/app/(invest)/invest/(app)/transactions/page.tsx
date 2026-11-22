import type { Metadata } from "next";
import { InvestTransactionList } from "@/components/invest/transactions/transaction-list";

export const metadata: Metadata = { title: "Transactions" };

export default function Page() {
  return <InvestTransactionList />;
}
