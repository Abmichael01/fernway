"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categoryLabels } from "@/config/categories";
import { useAccounts } from "@/hooks/accounts/useAccounts";
import type {
  TransactionCategory,
  TransactionDirection,
  TransactionFilters as Filters,
} from "@/types/banking";

const ALL = "all";

interface TransactionFiltersProps {
  value: Filters;
  onChange: (filters: Filters) => void;
}

export function TransactionFilters({ value, onChange }: TransactionFiltersProps) {
  const { data: accounts } = useAccounts();
  const update = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={value.search ?? ""}
          onChange={(event) => update({ search: event.target.value || undefined })}
          placeholder="Search by name, note or reference"
          aria-label="Search transactions"
          className="h-11 bg-card pr-10 pl-9"
        />
        {value.search && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1.5 -translate-y-1/2"
            onClick={() => update({ search: undefined })}
            aria-label="Clear search"
          >
            <X />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Tabs
          value={value.direction ?? ALL}
          onValueChange={(next) =>
            update({ direction: next === ALL ? undefined : (next as TransactionDirection) })
          }
        >
          <TabsList aria-label="Direction">
            <TabsTrigger value={ALL}>All</TabsTrigger>
            <TabsTrigger value="credit">Money in</TabsTrigger>
            <TabsTrigger value="debit">Money out</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select
          value={value.accountId ?? ALL}
          onValueChange={(next) => update({ accountId: next === ALL ? undefined : next })}
        >
          <SelectTrigger aria-label="Account" className="min-w-40 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All accounts</SelectItem>
            {accounts?.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.category ?? ALL}
          onValueChange={(next) =>
            update({ category: next === ALL ? undefined : (next as TransactionCategory) })
          }
        >
          <SelectTrigger aria-label="Category" className="min-w-40 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {Object.entries(categoryLabels)
              .filter(([category]) => category !== "crypto")
              .map(([category, label]) => (
                <SelectItem key={category} value={category}>
                  {label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
