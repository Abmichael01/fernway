import type { Metadata } from "next";
import { TransactionsView } from "@/components/dashboard/transactions/transactions-view";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Transactions" };

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Transactions" />
      <TransactionsView />
    </div>
  );
}
