import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { InvestCustomerDetailView } from "@/components/admin/invest/customers/invest-customer-detail-view";
import { Skeleton } from "@/components/ui/skeleton";
import { INVEST_ENABLED } from "@/config/features";

/** Admin pages wait for the access check before rendering, so they opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Invest customer" };

/** The id is read on the client (useParams) behind Suspense, so the page shell still prerenders. */
export default function Page() {
  if (!INVEST_ENABLED) notFound();
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <InvestCustomerDetailView />
    </Suspense>
  );
}
