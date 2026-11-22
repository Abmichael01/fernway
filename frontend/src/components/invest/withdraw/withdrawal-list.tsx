"use client";

import { ArrowUpFromLine } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import { CoinIcon } from "@/components/shared/coin-icon";
import { CopyButton } from "@/components/shared/copy-button";
import { Money } from "@/components/shared/money";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { useCancelWithdrawal } from "@/hooks/invest/useCancelWithdrawal";
import { useWithdrawals } from "@/hooks/invest/useWithdrawals";
import type { Withdrawal, WithdrawalStatus } from "@/types/invest";
import { formatDate, shorten } from "../shared/format";

const statusLabel: Record<WithdrawalStatus, string> = { requested: "Requested", paid: "Paid", rejected: "Declined", cancelled: "Cancelled" };
const statusVariant: Record<WithdrawalStatus, "default" | "secondary" | "destructive" | "outline"> = {
  requested: "outline",
  paid: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

export function WithdrawalList() {
  const { data, isPending, isError, refetch } = useWithdrawals();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">Your withdrawals</CardTitle>
      </CardHeader>
      <CardContent>
        {isError ? (
          <QueryError message="We couldn't load your withdrawals." onRetry={() => void refetch()} />
        ) : isPending ? (
          <div className="flex flex-col gap-3" aria-busy="true">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState icon={<ArrowUpFromLine />} title="No withdrawals yet" description="Requests you make appear here." />
        ) : (
          <ItemGroup>
            {data.map((withdrawal, index) => (
              <div key={withdrawal.id}>
                {index > 0 && <ItemSeparator />}
                <WithdrawalRow withdrawal={withdrawal} />
              </div>
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
}

function WithdrawalRow({ withdrawal }: { withdrawal: Withdrawal }) {
  return (
    <Item className="items-start px-0 py-3">
      <ItemMedia>
        <CoinIcon symbol={withdrawal.symbol} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <Money amount={withdrawal.amount} currency="USD" />
          <Badge variant={statusVariant[withdrawal.status]}>{statusLabel[withdrawal.status]}</Badge>
        </ItemTitle>
        <ItemDescription className="flex flex-wrap items-center gap-x-1">
          {withdrawal.symbol} · {withdrawal.network} · <span className="font-mono">{shorten(withdrawal.address, 6, 6)}</span>
        </ItemDescription>
        <p className="text-xs text-muted-foreground">Requested {formatDate(withdrawal.requestedAt)}</p>
        {withdrawal.status === "paid" && withdrawal.payoutTxid && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Transaction <span className="font-mono">{shorten(withdrawal.payoutTxid, 8, 6)}</span>
            <CopyButton value={withdrawal.payoutTxid} label="Transaction ID" className="size-6" />
          </p>
        )}
        {withdrawal.status === "rejected" && withdrawal.rejectReason && (
          <p className="text-xs text-debit">Declined: {withdrawal.rejectReason}</p>
        )}
      </ItemContent>
      {withdrawal.status === "requested" && (
        <ItemActions>
          <CancelButton id={withdrawal.id} />
        </ItemActions>
      )}
    </Item>
  );
}

function CancelButton({ id }: { id: string }) {
  const cancel = useCancelWithdrawal();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Cancel request
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this withdrawal?</AlertDialogTitle>
          <AlertDialogDescription>The held amount goes back to your investing cash.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep request</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              cancel.mutate(id, {
                onSuccess: () => toast.success("Withdrawal cancelled"),
                onError: (error) => toast.error(error instanceof ApiError ? error.message : "We couldn't cancel it. Try again."),
              })
            }
          >
            Cancel request
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
