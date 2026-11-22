"use client";

import { Users } from "lucide-react";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecipients } from "@/hooks/transfers/useRecipients";
import { maskAccountNumber } from "@/lib/routing";
import { cn } from "@/lib/utils";
import type { Recipient } from "@/types/banking";

interface RecipientPickerProps {
  selected: { routingNumber: string; accountNumber: string };
  onSelect: (recipient: Recipient) => void;
  className?: string;
}

export function RecipientPicker({ selected, onSelect, className }: RecipientPickerProps) {
  const { data: recipients, isPending, isError, refetch } = useRecipients();

  return (
    <Card className={cn("gap-2", className)}>
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">Saved recipients</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        {isError ? (
          <QueryError message="We couldn't load your recipients." onRetry={() => void refetch()} className="mx-2" />
        ) : isPending ? (
          <div className="flex flex-col gap-2 px-2" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : recipients.length === 0 ? (
          <EmptyState icon={<Users />} title="No saved recipients" description="People you pay can be saved here for next time." className="py-6" />
        ) : (
          <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {recipients.map((recipient) => {
              const active =
                recipient.routingNumber === selected.routingNumber && recipient.accountNumber === selected.accountNumber;
              const initials = recipient.name
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("");
              return (
                <li key={recipient.id} className="shrink-0">
                  <Item asChild size="sm" className={cn("px-2", active ? "bg-secondary" : "hover:bg-muted/70")}>
                    <button type="button" onClick={() => onSelect(recipient)} aria-pressed={active} className="text-left">
                      <ItemMedia>
                        <Avatar className="size-9">
                          <AvatarFallback
                            className={cn("text-xs font-semibold", active ? "bg-primary text-primary-foreground" : "bg-muted text-primary")}
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </ItemMedia>
                      <ItemContent className="min-w-0 pr-2">
                        <ItemTitle className="truncate">{recipient.name}</ItemTitle>
                        <ItemDescription className="truncate text-xs">
                          {recipient.bankName} · {maskAccountNumber(recipient.accountNumber)}
                        </ItemDescription>
                      </ItemContent>
                    </button>
                  </Item>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
