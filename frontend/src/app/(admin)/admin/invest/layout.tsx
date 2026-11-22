import { Suspense } from "react";
import { notFound } from "next/navigation";
import { InvestAdminNav } from "@/components/admin/invest/shared/invest-admin-nav";
import { INVEST_ENABLED } from "@/config/features";

export default function AdminInvestLayout({ children }: LayoutProps<"/admin/invest">) {
  if (!INVEST_ENABLED) notFound();
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<div className="h-10 w-full" />}>
        <InvestAdminNav />
      </Suspense>
      {children}
    </div>
  );
}
