"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import { ActiveBadge } from "@/components/admin/invest/shared/status-badges";
import { RowsSkeleton } from "@/components/admin/invest/shared/table-skeleton";
import { Money } from "@/components/shared/money";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInvestCustomers } from "@/hooks/admin-invest/useInvestCustomers";
import { formatDayLabel } from "@/lib/dates";
import { CreateInvestCustomerDialog } from "./create-invest-customer-dialog";

export function InvestCustomersView() {
  const { data: customers, isPending, isError, refetch } = useInvestCustomers();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!customers || !term) return customers ?? [];
    return customers.filter((c) => `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(term));
  }, [customers, search]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invest customers"
        description="Invest customers are separate from banking customers. They sign in at /invest/sign-in."
        actions={
          <CreateInvestCustomerDialog>
            <Button size="lg">
              <UserPlus data-icon="inline-start" />
              New customer
            </Button>
          </CreateInvestCustomerDialog>
        }
      />

      <InputGroup className="h-10 w-full bg-card sm:w-80">
        <InputGroupAddon>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          aria-label="Search Invest customers"
        />
      </InputGroup>

      {isError ? (
        <QueryError message="We couldn't load Invest customers." onRetry={() => void refetch()} />
      ) : isPending ? (
        <RowsSkeleton />
      ) : customers.length === 0 ? (
        <EmptyState icon={<Users />} title="No Invest customers yet" description="Create the first customer. They can sign in right away." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Search />} title="No matches" description={`No customer matches "${search}".`} />
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-right">Cash</TableHead>
                <TableHead className="pr-4 text-right">Invested</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => (
                <TableRow key={customer.id} className="relative">
                  <TableCell className="py-3 pl-4">
                    <Link
                      href={`/admin/invest/customers/${customer.id}`}
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
                  <TableCell className="hidden sm:table-cell">
                    <ActiveBadge disabled={customer.disabled} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">{formatDayLabel(customer.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Money amount={customer.cash} currency="USD" />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Money amount={customer.invested} currency="USD" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
