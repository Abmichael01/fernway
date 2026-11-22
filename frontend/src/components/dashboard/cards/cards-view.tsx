"use client";

import { useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { QueryError } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCards } from "@/hooks/cards/useCards";
import { CardControls } from "./card-controls";
import { CardFace } from "@/components/shared/card-face";
import { CreateCardDialog } from "./create-card-dialog";

export function CardsView() {
  const { data: cards, isPending, isError, refetch } = useCards();
  const [addCardOpen, setAddCardOpen] = useState(false);

  const header = (
    <PageHeader
      title="Cards"
      actions={
        !isPending && !isError && cards && cards.length > 0 ? (
          <Button
            onClick={() => setAddCardOpen(true)}
            className="bg-primary h-10 rounded-xl font-bold gap-2 text-primary-foreground hover:opacity-95 shadow-xs"
          >
            <Plus className="size-4" />
            <span>Add Card</span>
          </Button>
        ) : undefined
      }
    />
  );

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <QueryError message="We couldn't load your cards." onRetry={() => void refetch()} />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <div className="flex flex-col gap-10" aria-hidden="true">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="grid items-start gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
              <Skeleton className="aspect-[1.586] w-full max-w-[420px] rounded-[18px]" />
              <Skeleton className="h-56 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-10 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary mb-3.5">
            <CreditCard className="size-7" />
          </div>
          <h3 className="font-heading font-bold text-lg text-foreground">No card yet</h3>
          <Button
            onClick={() => setAddCardOpen(true)}
            className="mt-5 bg-primary h-11 rounded-xl font-bold gap-2 text-primary-foreground hover:opacity-95"
          >
            <Plus className="size-4" />
            <span>Order Physical Card</span>
          </Button>
        </div>

        <CreateCardDialog open={addCardOpen} onOpenChange={setAddCardOpen} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {header}

      <div className="flex flex-col gap-8">
        {cards.map((card) => (
          <section key={card.id} aria-label={card.label} className="flex flex-col gap-3">
            {cards.length > 1 && (
              <h2 className="font-heading text-sm font-semibold text-foreground">{card.label}</h2>
            )}
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
              <CardFace card={card} className="max-w-[420px]" />
              <CardControls card={card} />
            </div>
          </section>
        ))}
      </div>

      <CreateCardDialog open={addCardOpen} onOpenChange={setAddCardOpen} />
    </div>
  );
}
