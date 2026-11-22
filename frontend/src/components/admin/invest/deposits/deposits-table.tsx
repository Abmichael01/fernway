import Link from "next/link";
import { DepositStatusBadge } from "@/components/admin/invest/shared/status-badges";
import { CopyButton } from "@/components/shared/copy-button";
import { Money } from "@/components/shared/money";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatQuantity } from "@/lib/crypto";
import { formatDateTime } from "@/lib/dates";
import type { DepositPayment } from "@/types/invest";

type Row = DepositPayment & { customer?: { id: string; name: string; email: string } };

/** Read-only list of deposits. Pass rows with a `customer` to show who sent them. */
export function DepositsTable({ rows, showCustomer = false }: { rows: Row[]; showCustomer?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {showCustomer && <TableHead className="pl-4">Customer</TableHead>}
            <TableHead className={showCustomer ? undefined : "pl-4"}>Coin</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Gateway fee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Credited</TableHead>
            <TableHead className="text-right">Price used</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Received</TableHead>
            <TableHead className="pr-4">Credited on</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {showCustomer && (
                <TableCell className="pl-4">
                  {row.customer ? (
                    <Link href={`/admin/invest/customers/${row.customer.id}`} className="font-medium hover:underline">
                      {row.customer.name}
                    </Link>
                  ) : null}
                </TableCell>
              )}
              <TableCell className={showCustomer ? "font-medium" : "pl-4 font-medium"}>{row.symbol}</TableCell>
              <TableCell className="text-right tabular-nums">{formatQuantity(row.quantity, row.symbol)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{formatQuantity(row.feeQuantity, row.symbol)}</TableCell>
              <TableCell>
                <DepositStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="text-right">{row.credited === null ? "—" : <Money amount={row.credited} currency="USD" />}</TableCell>
              <TableCell className="text-right">{row.price === null ? "—" : <Money amount={row.price} currency="USD" />}</TableCell>
              <TableCell>
                <span className="flex items-center gap-1">
                  <span className="max-w-32 truncate font-mono text-xs" title={row.txid}>
                    {row.txid}
                  </span>
                  <CopyButton value={row.txid} label="Transaction ID" className="size-7" />
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(row.receivedAt)}</TableCell>
              <TableCell className="pr-4 whitespace-nowrap text-muted-foreground">{row.creditedAt ? formatDateTime(row.creditedAt) : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
