"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, TrendingUp } from "lucide-react";
import { ActiveBadge } from "@/components/admin/invest/shared/status-badges";
import { DepositsTable } from "@/components/admin/invest/deposits/deposits-table";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/api/client";
import { useInvestCustomer } from "@/hooks/admin-invest/useInvestCustomer";
import { CustomerOverviewPanel } from "./customer-overview-panel";
import { CustomerProfilePanel } from "./customer-profile-panel";
import { CustomerTransactionsTable } from "./customer-transactions-table";
import { CustomerWithdrawalsTable } from "./customer-withdrawals-table";
import { RecordEarningModal } from "./record-earning-modal";

export function InvestCustomerDetailView() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError, error, refetch } = useInvestCustomer(id);

  const back = (
    <Link href="/admin/invest/customers" className="inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" aria-hidden="true" /> All Invest customers
    </Link>
  );

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="flex flex-col gap-4">
        {back}
        {notFound ? (
          <EmptyState title="Customer not found" description="This Invest customer doesn't exist." />
        ) : (
          <QueryError message="We couldn't load this customer." onRetry={() => void refetch()} />
        )}
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-4" aria-hidden="true">
        {back}
        <Skeleton className="h-16 w-80" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { customer, overview, transactions, deposits, withdrawals } = data;
  return (
    <div className="flex flex-col gap-6">
      {back}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-brand-gradient font-semibold text-white">
              {customer.firstName[0]}
              {customer.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-figure text-2xl font-semibold tracking-tight">
                {customer.firstName} {customer.lastName}
              </h1>
              <ActiveBadge disabled={customer.disabled} />
            </div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" aria-hidden="true" /> {customer.email}
              </span>
              {customer.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5" aria-hidden="true" /> {customer.phone}
                </span>
              )}
            </p>
          </div>
        </div>
        <RecordEarningModal customerId={customer.id} positions={overview.portfolios}>
          <Button size="sm">
            <TrendingUp className="size-4" data-icon="inline-start" aria-hidden="true" />
            Record daily earning
          </Button>
        </RecordEarningModal>
      </header>

      <Tabs defaultValue="overview" className="flex flex-col gap-6">
        <TabsList className="self-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <CustomerOverviewPanel overview={overview} />
        </TabsContent>
        <TabsContent value="transactions">
          {transactions.length === 0 ? (
            <EmptyState title="No transactions yet" description="Deposits, trades and withdrawals appear here." />
          ) : (
            <CustomerTransactionsTable rows={transactions} />
          )}
        </TabsContent>
        <TabsContent value="deposits">
          {deposits.length === 0 ? (
            <EmptyState title="No deposits yet" description="Deposits appear here once the customer sends crypto to their deposit address." />
          ) : (
            <DepositsTable rows={deposits} />
          )}
        </TabsContent>
        <TabsContent value="withdrawals">
          {withdrawals.length === 0 ? (
            <EmptyState title="No withdrawals yet" description="Requests appear here. Pay or decline them in the Withdrawals queue." />
          ) : (
            <CustomerWithdrawalsTable rows={withdrawals} />
          )}
        </TabsContent>
        <TabsContent value="profile">
          <CustomerProfilePanel customer={customer} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
