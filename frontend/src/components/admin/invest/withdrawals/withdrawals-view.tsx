"use client";

import Link from "next/link";
import { useState } from "react";
import { Hourglass } from "lucide-react";
import { WithdrawalStatusBadge } from "@/components/admin/invest/shared/status-badges";
import { RowsSkeleton } from "@/components/admin/invest/shared/table-skeleton";
import { CoinIcon } from "@/components/shared/coin-icon";
import { CopyButton } from "@/components/shared/copy-button";
import { Money } from "@/components/shared/money";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useInvestWithdrawals } from "@/hooks/admin-invest/useInvestWithdrawals";
import { formatQuantity } from "@/lib/crypto";
import { formatDateTime } from "@/lib/dates";
import type { AdminWithdrawal, WithdrawalStatus } from "@/types/invest";
import { PayWithdrawalModal, RejectWithdrawalModal } from "./withdrawal-modals";

type Filter = WithdrawalStatus | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "requested", label: "Requested" },
  { value: "paid", label: "Paid" },
  { value: "rejected", label: "Declined" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
];

function WithdrawalCard({ item }: { item: AdminWithdrawal }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <CoinIcon symbol={item.symbol} className="size-10" />
          <div className="min-w-0 flex-1">
            <Link href={`/admin/invest/customers/${item.customer.id}`} className="block truncate font-medium hover:underline">
              {item.customer.name}
            </Link>
            <span className="block truncate text-xs text-muted-foreground">{item.customer.email}</span>
          </div>
          <div className="text-right">
            <Money amount={item.amount} currency="USD" className="block font-heading text-lg font-semibold" />
            <span className="block text-xs text-muted-foreground">{formatDateTime(item.requestedAt)}</span>
          </div>
          <WithdrawalStatusBadge status={item.status} />
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Coin and network</dt>
            <dd>
              {item.symbol} · {item.network}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">To send</dt>
            <dd className="tabular-nums">
              {item.estimatedQuantity === null
                ? "Prices are offline, so no estimate."
                : `≈ ${formatQuantity(item.estimatedQuantity, item.symbol)} at today's price`}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-muted-foreground">Address</dt>
            <dd className="flex items-center gap-1">
              <span className="font-mono text-xs break-all select-all">{item.address}</span>
              <CopyButton value={item.address} label="Address" className="size-7 shrink-0" />
            </dd>
          </div>
          {item.status === "paid" && item.payoutTxid && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">Payment transaction ID</dt>
              <dd className="flex items-center gap-1">
                <span className="font-mono text-xs break-all select-all">{item.payoutTxid}</span>
                <CopyButton value={item.payoutTxid} label="Transaction ID" className="size-7 shrink-0" />
              </dd>
            </div>
          )}
          {item.status === "rejected" && item.rejectReason && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">Reason shown to the customer</dt>
              <dd>{item.rejectReason}</dd>
            </div>
          )}
        </dl>

        {item.status === "requested" && (
          <div className="flex flex-wrap gap-2">
            <PayWithdrawalModal withdrawal={item}>
              <Button>Mark as paid</Button>
            </PayWithdrawalModal>
            <RejectWithdrawalModal withdrawal={item}>
              <Button variant="outline">Decline</Button>
            </RejectWithdrawalModal>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WithdrawalsView() {
  const [filter, setFilter] = useState<Filter>("requested");
  const { data, isPending, isError, refetch } = useInvestWithdrawals(filter === "all" ? undefined : filter);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Withdrawals"
        description="Customers request a payout in crypto. You send it by hand from the company wallet, then mark it as paid."
      />
      <ToggleGroup
        type="single"
        variant="outline"
        value={filter}
        onValueChange={(value) => value && setFilter(value as Filter)}
        aria-label="Filter withdrawals"
        className="self-start overflow-x-auto"
      >
        {FILTERS.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value}>
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {isError ? (
        <QueryError message="We couldn't load withdrawals." onRetry={() => void refetch()} />
      ) : isPending ? (
        <RowsSkeleton rows={3} className="h-48" />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<Hourglass />}
          title={filter === "requested" ? "Nothing waiting" : "No withdrawals here"}
          description={filter === "requested" ? "New requests appear here until you pay or decline them." : "No withdrawals match this filter."}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {data.map((item) => (
            <WithdrawalCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
