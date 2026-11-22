import { EntryStatusBadge } from "@/components/admin/invest/shared/status-badges";
import { Money } from "@/components/shared/money";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { InvestTransaction } from "@/types/invest";

/** Read-only. Entries are created by deposits, trades and withdrawals only. */
export function CustomerTransactionsTable({ rows }: { rows: InvestTransaction[] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Fee</TableHead>
            <TableHead className="pr-4 text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="pl-4 whitespace-nowrap text-muted-foreground">{formatDateTime(row.occurredAt)}</TableCell>
              <TableCell>
                <span className="block font-medium">{row.description}</span>
                <span className="block text-xs text-muted-foreground">
                  {row.direction === "credit" ? "Money in" : "Money out"}
                  {row.portfolioName ? ` · ${row.portfolioName}` : ""}
                </span>
              </TableCell>
              <TableCell>
                <EntryStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {row.fee > 0 ? <Money amount={row.fee} currency="USD" /> : "—"}
              </TableCell>
              <TableCell className={cn("pr-4 text-right font-medium", row.direction === "credit" && "text-credit")}>
                <Money amount={row.amount} currency="USD" signed={false} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
