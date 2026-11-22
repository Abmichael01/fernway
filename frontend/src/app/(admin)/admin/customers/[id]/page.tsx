import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerDetailView } from "@/components/admin/customers/customer-detail-view";
import { Skeleton } from "@/components/ui/skeleton";

/** Admin pages wait for the access check before rendering, so they opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Customer" };

/** The id is read on the client (useParams) behind Suspense, so the page shell still prerenders. */
export default function AdminCustomerPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <CustomerDetailView />
    </Suspense>
  );
}
