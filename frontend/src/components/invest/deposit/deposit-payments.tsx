import { CoinIcon } from "@/components/shared/coin-icon";
import { CopyButton } from "@/components/shared/copy-button";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/query-states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { formatQuantity } from "@/lib/crypto";
import type { DepositPayment } from "@/types/invest";
import { formatDate, shorten } from "../shared/format";

export function DepositPayments({ payments }: { payments: DepositPayment[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">Deposit payments</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <EmptyState title="No deposits yet" description="Payments you send to your deposit addresses appear here." />
        ) : (
          <ItemGroup>
            {payments.map((payment, index) => (
              <div key={payment.id}>
                {index > 0 && <ItemSeparator />}
                <Item className="px-0 py-3">
                  <ItemMedia>
                    <CoinIcon symbol={payment.symbol} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      {formatQuantity(payment.quantity, payment.symbol)}
                      <Badge variant={payment.status === "credited" ? "secondary" : "outline"}>
                        {payment.status === "credited" ? "Credited" : "Pending"}
                      </Badge>
                    </ItemTitle>
                    <ItemDescription className="flex items-center gap-1">
                      {formatDate(payment.receivedAt)} · <span className="font-mono">{shorten(payment.txid, 8, 6)}</span>
                      <CopyButton value={payment.txid} label="Transaction ID" className="size-6" />
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    {payment.credited !== null ? (
                      <Money amount={payment.credited} currency="USD" signed className="font-medium text-credit" />
                    ) : (
                      <span className="text-sm text-muted-foreground">Waiting for confirmation</span>
                    )}
                  </ItemActions>
                </Item>
              </div>
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
}
