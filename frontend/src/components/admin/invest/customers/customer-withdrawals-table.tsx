import { WithdrawalStatusBadge } from "@/components/admin/invest/shared/status-badges";
import { CopyButton } from "@/components/shared/copy-button";
import { Money } from "@/components/shared/money";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/dates";
import type { Withdrawal } from "@/types/invest";

/** Read-only withdrawals of one customer. Paying and declining happen in the Withdrawals queue. */
export function CustomerWithdrawalsTable({ rows }: { rows: Withdrawal[] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Requested</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Coin</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-4">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="pl-4 whitespace-nowrap text-muted-foreground">{formatDateTime(row.requestedAt)}</TableCell>
              <TableCell className="text-right">
                <Money amount={row.amount} currency="USD" />
              </TableCell>
              <TableCell>
                {row.symbol}
                <span className="block text-xs text-muted-foreground">{row.network}</span>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1">
                  <span className="max-w-40 truncate font-mono text-xs" title={row.address}>
                    {row.address}
                  </span>
                  <CopyButton value={row.address} label="Address" className="size-7" />
                </span>
              </TableCell>
              <TableCell>
                <WithdrawalStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                {row.status === "paid" && row.payoutTxid ? `Transaction ID ${row.payoutTxid}` : null}
                {row.status === "rejected" && row.rejectReason ? row.rejectReason : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
