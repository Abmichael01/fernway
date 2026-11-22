"use client";

import { ArrowDownToLine } from "lucide-react";
import { DepositsTable } from "@/components/admin/invest/deposits/deposits-table";
import { RowsSkeleton } from "@/components/admin/invest/shared/table-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { useInvestDeposits } from "@/hooks/admin-invest/useInvestDeposits";

export function DepositsView() {
  const { data, isPending, isError, refetch } = useInvestDeposits();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Deposits"
        description="Crypto sent by customers through CryptAPI. A deposit is credited as investing cash once it is confirmed. This list is read-only."
      />
      {isError ? (
        <QueryError message="We couldn't load deposits." onRetry={() => void refetch()} />
      ) : isPending ? (
        <RowsSkeleton rows={6} className="h-12" />
      ) : data.length === 0 ? (
        <EmptyState icon={<ArrowDownToLine />} title="No deposits yet" description="Deposits appear here when a customer sends crypto to their deposit address." />
      ) : (
        <DepositsTable rows={data} showCustomer />
      )}
    </div>
  );
}
