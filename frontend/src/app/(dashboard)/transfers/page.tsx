import type { Metadata } from "next";
import { Suspense } from "react";
import { SendMoneyView } from "@/components/dashboard/transfers/send-money-view";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Transfers" };

export default function TransfersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Transfers" />
      <Suspense fallback={<Skeleton className="h-[32rem] w-full rounded-2xl" />}>
        <SendMoneyView />
      </Suspense>
    </div>
  );
}
