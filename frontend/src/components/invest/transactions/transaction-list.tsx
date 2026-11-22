"use client";

import { useState } from "react";
import { ReceiptText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Card, CardContent } from "@/components/ui/card";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvestTransactions } from "@/hooks/invest/useInvestTransactions";
import type { InvestTransaction } from "@/types/invest";
import { TransactionDetailModal } from "./transaction-detail-modal";
import { TransactionRow } from "./transaction-row";

export function InvestTransactionList() {
  const { data, isPending, isError, refetch } = useInvestTransactions();
  const [selected, setSelected] = useState<InvestTransaction | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Transactions" description="Every movement of your investing cash." />
      {isError ? (
        <QueryError message="We couldn't load your transactions." onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState icon={<ReceiptText />} title="No transactions yet" description="Deposits, investments and withdrawals appear here." className="rounded-lg border border-dashed" />
      ) : (
        <Card>
          <CardContent>
            <ItemGroup>
              {data.map((transaction, index) => (
                <div key={transaction.id}>
                  {index > 0 && <ItemSeparator />}
                  <TransactionRow transaction={transaction} onSelect={() => setSelected(transaction)} />
                </div>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      )}
      <TransactionDetailModal transaction={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
