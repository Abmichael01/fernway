"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownLeft, ChevronRight, Landmark, type LucideIcon, ReceiptText, Search, UserPlus, Users } from "lucide-react";
import { Money } from "@/components/shared/money";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminStats, useCustomers } from "@/hooks/admin/useAdminCustomers";
import { formatDayLabel, formatRelative } from "@/lib/dates";
import { getTheme } from "@/config/themes";
import { CreateCustomerDialog } from "./create-customer-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VaultWalletsView } from "./vault-wallets-view";
import { VAULT_ENABLED } from "@/config/features";
import { ShieldCheck } from "lucide-react";

export function CustomersView() {
  const { data: customers, isPending, isError, refetch } = useCustomers();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!customers || !term) return customers ?? [];
    return customers.filter((customer) =>
      `${customer.firstName} ${customer.lastName} ${customer.email}`.toLowerCase().includes(term),
    );
  }, [customers, search]);

  const { data: stats, isPending: statsPending, isError: statsError, refetch: refetchStats } = useAdminStats();

  return (
    <Tabs defaultValue="banking" className="flex flex-col gap-6">
      {VAULT_ENABLED && (
        <div className="flex items-center justify-between border-b pb-3">
          <TabsList className="h-11 rounded-2xl bg-muted/60 p-1">
            <TabsTrigger value="banking" className="gap-2 rounded-xl text-xs font-bold">
              <Landmark className="size-3.5" />
              <span>Banking Customers</span>
            </TabsTrigger>
            <TabsTrigger value="vault" className="gap-2 rounded-xl text-xs font-bold">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Vault Crypto Users & Wallets</span>
            </TabsTrigger>
          </TabsList>
        </div>
      )}

      <TabsContent value="banking" className="flex flex-col gap-8 m-0">
        <PageHeader
          title="Customers"
          description="Create customers, open their accounts and enter their transactions."
          actions={
            <CreateCustomerDialog>
              <Button size="lg">
                <UserPlus data-icon="inline-start" />
                New customer
              </Button>
            </CreateCustomerDialog>
          }
        />

        {statsError ? (
          <QueryError message="We couldn't load the totals." onRetry={() => void refetchStats()} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              icon={Users}
              label="Customers"
              loading={statsPending}
              value={stats?.customers.toLocaleString("en-US")}
              detail={
                stats &&
                (stats.customers === 0
                  ? "None yet. Create the first one."
                  : `${stats.activeCustomers} can sign in · ${stats.customers - stats.activeCustomers} disabled`)
              }
            />
            <Stat
              icon={Landmark}
              label="Money held"
              loading={statsPending}
              value={stats && <Money amount={stats.totalBalance} currency="USD" />}
              detail={stats && `Across ${stats.accounts} ${stats.accounts === 1 ? "account" : "accounts"}`}
            />
            <Stat
              icon={ArrowDownLeft}
              label={stats ? `Money in, ${stats.monthLabel}` : "Money in this month"}
              loading={statsPending}
              value={
                stats && (
                  <Money
                    amount={stats.moneyInThisMonth}
                    currency="USD"
                    className={stats.moneyInThisMonth > 0 ? "text-credit" : undefined}
                  />
                )
              }
              detail={
                stats && (
                  <>
                    Money out <Money amount={stats.moneyOutThisMonth} currency="USD" />
                  </>
                )
              }
            />
            <Stat
              icon={ReceiptText}
              label={stats ? `Transactions, ${stats.monthLabel}` : "Transactions this month"}
              loading={statsPending}
              value={stats?.transactionsThisMonth.toLocaleString("en-US")}
              detail={
                stats &&
                (stats.lastEnteredAt
                  ? `Last added ${formatRelative(stats.lastEnteredAt).toLowerCase()}`
                  : "No transactions entered yet")
              }
            />
          </div>
        )}

        <section aria-labelledby="customer-list" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="customer-list" className="font-heading text-lg font-semibold">
              All customers
            </h2>
            <InputGroup className="h-10 w-full bg-card sm:w-80">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                aria-label="Search customers"
              />
            </InputGroup>
          </div>

          {isError ? (
            <QueryError message="We couldn't load customers." onRetry={() => void refetch()} />
          ) : isPending ? (
            <div className="flex flex-col gap-2" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <EmptyState
              icon={<Users />}
              title="No customers yet"
              description="Create your first customer, then add their transactions so their app shows real transactions."
            />
          ) : filtered.length === 0 ? (
            <EmptyState icon={<Search />} title="No matches" description={`No customer matches "${search}".`} />
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Accounts</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Theme</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((customer) => (
                    <TableRow key={customer.id} className="group relative">
                      <TableCell className="py-3 pl-4">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="flex items-center gap-3 outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring"
                        >
                          <Avatar className="size-9">
                            <AvatarFallback className="bg-brand-gradient text-xs font-semibold text-white">
                              {customer.firstName[0]}
                              {customer.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {customer.firstName} {customer.lastName}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">{customer.email}</span>
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{customer.accountCount}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {customer.disabled ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            Disabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-credit/30 text-credit">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span
                            className="size-2.5 rounded-full"
                            style={{
                              backgroundColor: getTheme(customer.theme).primary,
                            }}
                          />
                          <span>{getTheme(customer.theme).name.split(" ")[0]}</span>
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {formatDayLabel(customer.createdAt)}
                      </TableCell>
                      <TableCell className="text-right font-heading font-semibold">
                        <Money amount={customer.totalBalance} currency="USD" />
                      </TableCell>
                      <TableCell className="pr-4 text-muted-foreground">
                        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </TabsContent>

      {VAULT_ENABLED && (
        <TabsContent value="vault" className="m-0">
          <VaultWalletsView />
        </TabsContent>
      )}
    </Tabs>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  detail,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  detail: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border bg-card p-5">
      <div className="flex items-center gap-2.5">
        <span className="bg-brand-gradient grid size-8 shrink-0 place-items-center rounded-full text-white">
          <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="truncate text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      {loading ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : (
        <div>
          <p className="font-heading text-[1.75rem] leading-tight font-semibold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
      )}
    </div>
  );
}
