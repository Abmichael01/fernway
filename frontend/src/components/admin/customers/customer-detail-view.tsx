"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Bitcoin,
  ArrowLeft,
  CalendarClock,
  CreditCard,
  Landmark,
  Mail,
  MoreHorizontal,
  Phone,
  PiggyBank,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { CardFace } from "@/components/shared/card-face";
import { CategoryIcon } from "@/components/shared/category-icon";
import { Money } from "@/components/shared/money";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomer, useDeleteBill } from "@/hooks/admin/useAdminCustomers";
import type { AdminCustomer } from "@/types/admin";
import { AddBillDialog, IssueCardDialog, OpenAccountDialog, RecordCryptoBuyDialog } from "./customer-dialogs";
import { ProfilePanel } from "./profile-panel";
import { ThemePanel } from "./theme-panel";
import { TransactionSheet } from "./transaction-sheet";
import { TransactionsPanel } from "./transactions-panel";
import { VaultPanel } from "./vault-panel";
import { VAULT_ENABLED } from "@/config/features";

export function CustomerDetailView() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isPending, isError, error, refetch } = useCustomer(id);

  return (
    <div className="flex flex-col gap-8">
      <Link href="/admin" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All customers
      </Link>
      {isError ? (
        <QueryError message={error.message} onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-6" aria-hidden="true">
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      ) : (
        <CustomerDetail customer={customer} />
      )}
    </div>
  );
}

function CustomerDetail({ customer }: { customer: AdminCustomer }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-brand-gradient font-heading text-xl font-semibold text-white">
              {customer.firstName[0]}
              {customer.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-figure text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                {customer.firstName} {customer.lastName}
              </h1>
              {customer.disabled ? (
                <Badge variant="outline" className="text-muted-foreground">
                  Disabled
                </Badge>
              ) : (
                <Badge variant="outline" className="border-credit/30 text-credit">
                  Active
                </Badge>
              )}
            </div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" aria-hidden="true" />
                {customer.email}
              </span>
              {customer.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5" aria-hidden="true" />
                  {customer.phone}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="lg" onClick={() => setSheetOpen(true)} disabled={customer.accounts.length === 0}>
            <Plus data-icon="inline-start" />
            Add transaction
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" variant="outline" aria-label="More actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <OpenAccountDialog customer={customer}>
                <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                  <Landmark /> Open an account
                </DropdownMenuItem>
              </OpenAccountDialog>
              <IssueCardDialog customer={customer}>
                <DropdownMenuItem onSelect={(event) => event.preventDefault()} disabled={customer.accounts.length === 0}>
                  <CreditCard /> Issue a card
                </DropdownMenuItem>
              </IssueCardDialog>
              <AddBillDialog customer={customer}>
                <DropdownMenuItem onSelect={(event) => event.preventDefault()} disabled={customer.accounts.length === 0}>
                  <CalendarClock /> Add a monthly bill
                </DropdownMenuItem>
              </AddBillDialog>
              <RecordCryptoBuyDialog customer={customer}>
                <DropdownMenuItem onSelect={(event) => event.preventDefault()} disabled={customer.accounts.length === 0}>
                  <Bitcoin /> Record a crypto buy
                </DropdownMenuItem>
              </RecordCryptoBuyDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <section aria-label="Accounts" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {customer.accounts.map((account) => (
          <div key={account.id} className="relative overflow-hidden rounded-md border bg-card p-5">
            <span aria-hidden="true" className="bg-brand-gradient absolute inset-x-0 top-0 h-[3px]" />
            <div className="flex items-center gap-2.5">
              <span className="bg-brand-gradient grid size-8 place-items-center rounded-full text-white">
                {account.type === "savings" ? (
                  <PiggyBank className="size-4" aria-hidden="true" />
                ) : (
                  <Landmark className="size-4" aria-hidden="true" />
                )}
              </span>
              <span className="text-sm font-medium text-muted-foreground">{account.name}</span>
              {account.apy !== undefined && (
                <span className="ml-auto text-xs font-medium text-credit">{account.apy.toFixed(2)}% APY</span>
              )}
            </div>
            <p className="mt-4 font-heading text-[1.75rem] leading-tight font-semibold">
              <Money amount={account.balance} currency={account.currency} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground tabular-nums">
              Account ••{account.accountNumber.slice(-4)} · Routing {account.routingNumber}
            </p>
          </div>
        ))}
        <OpenAccountDialog customer={customer}>
          <button
            type="button"
            className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="size-5" aria-hidden="true" />
            Open an account
          </button>
        </OpenAccountDialog>
      </section>

      <Tabs defaultValue="transactions" className="gap-6">
        <TabsList className="w-full overflow-x-auto sm:w-fit">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          {VAULT_ENABLED && <TabsTrigger value="vault">Vault Wallet</TabsTrigger>}
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <TransactionsPanel customer={customer} />
        </TabsContent>
        {VAULT_ENABLED && (
          <TabsContent value="vault">
            <VaultPanel customerId={customer.id} />
          </TabsContent>
        )}
        <TabsContent value="bills">
          <BillsPanel customer={customer} />
        </TabsContent>
        <TabsContent value="cards">
          <CardsPanel customer={customer} />
        </TabsContent>
        <TabsContent value="theme">
          <ThemePanel customer={customer} />
        </TabsContent>
        <TabsContent value="profile">
          <ProfilePanel customer={customer} />
        </TabsContent>
      </Tabs>

      <TransactionSheet customer={customer} transaction={null} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

function BillsPanel({ customer }: { customer: AdminCustomer }) {
  const deleteBill = useDeleteBill();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddBillDialog customer={customer}>
          <Button disabled={customer.accounts.length === 0}>
            <Plus data-icon="inline-start" />
            Add a monthly bill
          </Button>
        </AddBillDialog>
      </div>
      {customer.bills.length === 0 ? (
        <EmptyState
          icon={<CalendarClock />}
          title="No bills yet"
          description="Add phone, internet, rent or subscriptions. They show as upcoming bills in the customer's app."
        />
      ) : (
        <ul className="divide-y rounded-md border">
          {customer.bills.map((bill) => (
            <li key={bill.id} className="flex items-center gap-3 px-4 py-3">
              <CategoryIcon category={bill.category} className="size-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{bill.payee}</p>
                <p className="text-xs text-muted-foreground">
                  Due on day {bill.dayOfMonth} each month
                  {bill.autopay ? " · Autopay" : ""}
                </p>
              </div>
              <Money amount={bill.amount} currency="USD" className="font-heading font-semibold" />
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${bill.payee}`}
                disabled={deleteBill.isPending}
                onClick={() =>
                  deleteBill.mutate(bill.id, {
                    onSuccess: () => toast.success(`${bill.payee} removed`),
                    onError: () => toast.error("We couldn't remove that bill."),
                  })
                }
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CardsPanel({ customer }: { customer: AdminCustomer }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <IssueCardDialog customer={customer}>
          <Button disabled={customer.accounts.length === 0}>
            <Plus data-icon="inline-start" />
            Issue a card
          </Button>
        </IssueCardDialog>
      </div>
      {customer.cards.length === 0 ? (
        <EmptyState
          icon={<CreditCard />}
          title="No cards yet"
          description="Issue a debit or virtual card on one of their accounts."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {customer.cards.map((card) => (
            <div key={card.id} className="flex flex-col gap-3">
              <CardFace card={card} />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{card.label}</span>
                <span className="text-muted-foreground">
                  <Money amount={card.spentThisMonth} currency="USD" whole /> of{" "}
                  <Money amount={card.monthlyLimit} currency="USD" whole />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
