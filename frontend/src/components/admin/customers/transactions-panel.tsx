"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal, Pencil, Plus, ReceiptText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoryLabels } from "@/config/categories";
import { useCustomerTransactions, useDeleteTransaction } from "@/hooks/admin/useAdminLedger";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { AdminCustomer } from "@/types/admin";
import type { Transaction } from "@/types/banking";
import { TransactionSheet } from "./transaction-sheet";

const ALL = "all";
const statusTone = { pending: "border-pending/30 text-pending", failed: "border-debit/30 text-debit" } as const;

export function TransactionsPanel({ customer }: { customer: AdminCustomer }) {
  const [accountId, setAccountId] = useState(ALL);
  const { data: transactions, isPending, isError, refetch } = useCustomerTransactions(
    customer.id,
    accountId === ALL ? undefined : accountId,
  );
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const deleteTransaction = useDeleteTransaction();
  const accountName = (id: string) => customer.accounts.find((account) => account.id === id)?.name ?? "";

  const openSheet = (transaction: Transaction | null) => {
    setEditing(transaction);
    setSheetOpen(true);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteTransaction.mutate(deleting.id, {
      onSuccess: () => toast.success("Transaction deleted"),
      onError: (error) => toast.error(error instanceof ApiError ? Object.values(error.fieldErrors)[0] ?? error.message : "We couldn't delete it."),
      onSettled: () => setDeleting(null),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger aria-label="Account" className="min-w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All accounts</SelectItem>
            {customer.accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => openSheet(null)} disabled={customer.accounts.length === 0}>
          <Plus data-icon="inline-start" />
          Add transaction
        </Button>
      </div>

      {isError ? (
        <QueryError message="We couldn't load transactions." onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<ReceiptText />}
          title="No transactions yet"
          description={
            customer.accounts.length === 0
              ? "Open an account first, then add the money coming in."
              : "Start with money coming in (like payroll), then add spending."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Transaction</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell">Account</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const moneyIn = transaction.direction === "credit";
                const signed = moneyIn ? transaction.amount : -(transaction.amount + transaction.fee);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "grid size-9 shrink-0 place-items-center rounded-full text-white dark:text-background",
                            moneyIn ? "bg-credit" : "bg-debit",
                          )}
                        >
                          {moneyIn ? <ArrowDownLeft className="size-4" aria-hidden="true" /> : <ArrowUpRight className="size-4" aria-hidden="true" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block max-w-[220px] truncate font-medium">{transaction.counterparty}</span>
                          <span className="block max-w-[220px] truncate text-xs text-muted-foreground">
                            {moneyIn ? "Money in" : "Money out"}
                            {transaction.narration && ` · ${transaction.narration}`}
                          </span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{formatDateTime(transaction.createdAt)}</TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{accountName(transaction.accountId)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="font-normal">
                        {categoryLabels[transaction.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Money
                        amount={signed}
                        currency={transaction.currency}
                        signed
                        className={cn(
                          "block font-heading font-semibold",
                          moneyIn && "text-credit",
                          transaction.status === "failed" && "text-muted-foreground line-through",
                        )}
                      />
                      {transaction.status !== "completed" && (
                        <Badge variant="outline" className={cn("mt-1 h-5 px-1.5 text-[0.68rem]", statusTone[transaction.status])}>
                          {transaction.status === "pending" ? "Pending" : "Failed"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="pr-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Actions for ${transaction.counterparty}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => openSheet(transaction)}>
                            <Pencil /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(transaction)}>
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <TransactionSheet customer={customer} transaction={editing} open={sheetOpen} onOpenChange={setSheetOpen} />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && !deleteTransaction.isPending && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && (
                <>
                  {deleting.counterparty}, <Money amount={deleting.amount} currency={deleting.currency} />. It disappears from{" "}
                  {customer.firstName}&apos;s app and the balance changes. This can&apos;t be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTransaction.isPending}>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              disabled={deleteTransaction.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteTransaction.isPending ? "Deleting…" : "Delete transaction"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
