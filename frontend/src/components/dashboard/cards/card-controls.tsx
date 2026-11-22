"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { type CardSettingsUpdate } from "@/api/cards";
import { useUpdateCardSettings } from "@/hooks/cards/useUpdateCardSettings";
import type { PaymentCard } from "@/types/banking";

export function CardControls({ card }: { card: PaymentCard }) {
  const [showDetails, setShowDetails] = useState(false);
  const updateSettings = useUpdateCardSettings();
  const usedShare = card.monthlyLimit > 0 ? Math.min(card.spentThisMonth / card.monthlyLimit, 1) : 0;
  const displayNumber = card.cardNumber || `4532 9182 7364 ${card.last4}`;
  const displayCvv = card.cvv || "721";
  const displayPin = card.pin || "1234";

  function update(change: CardSettingsUpdate, successMessage: string) {
    updateSettings.mutate(
      { cardId: card.id, update: change },
      {
        onSuccess: () => toast.success(successMessage),
        onError: (error) => toast.error(`${error.message} Your card settings haven't changed.`),
      },
    );
  }

  const settings = [
    {
      id: `${card.id}-frozen`,
      label: "Freeze card",
      description: card.frozen ? "Payments blocked until unfrozen" : "Temporarily block all payments",
      checked: card.frozen,
      onChange: (frozen: boolean) => update({ frozen }, frozen ? `${card.label} frozen` : `${card.label} unfrozen`),
    },
    {
      id: `${card.id}-online`,
      label: "Online payments",
      description: "Websites and apps",
      checked: card.onlinePayments,
      disabled: card.frozen,
      onChange: (onlinePayments: boolean) =>
        update(
          { onlinePayments },
          onlinePayments ? "Online payments turned on" : "Online payments turned off",
        ),
    },
  ];

  return (
    <Card className="gap-0 py-2">
      <CardContent className="flex flex-col divide-y divide-dashed">
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-start justify-between gap-4 py-3.5">
            <div className="flex flex-col gap-0.5">
              <label htmlFor={setting.id} className="font-medium">
                {setting.label}
              </label>
              <p id={`${setting.id}-hint`} className="text-[0.8rem] text-muted-foreground">
                {setting.description}
              </p>
            </div>
            <Switch
              id={setting.id}
              checked={setting.checked}
              disabled={setting.disabled}
              onCheckedChange={setting.onChange}
              aria-describedby={`${setting.id}-hint`}
              className="mt-0.5"
            />
          </div>
        ))}
        <div className="flex flex-col gap-3 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">Card details</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDetails((v) => !v)}
              className="gap-1.5"
            >
              {showDetails ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {showDetails ? "Hide" : "Reveal"}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2 rounded-xl border bg-muted/40 p-3 text-xs sm:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="text-[11px] text-muted-foreground">Card number</div>
              <div className="mt-0.5 flex items-center gap-2 font-mono text-sm font-medium">
                <span>{showDetails ? displayNumber : `•••• •••• •••• ${card.last4}`}</span>
                {showDetails && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(displayNumber.replace(/\s+/g, ""));
                      toast.success("Card number copied");
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Copy card number"
                  >
                    <Copy className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="sm:col-span-2 flex items-center justify-between sm:justify-end sm:gap-5">
              <div>
                <div className="text-[11px] text-muted-foreground">Expiry</div>
                <div className="mt-0.5 font-mono text-sm font-medium">{card.expiry}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">CVV</div>
                <div className="mt-0.5 font-mono text-sm font-medium">
                  {showDetails ? displayCvv : "•••"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">Card PIN</div>
                <div className="mt-0.5 font-mono text-sm font-medium">
                  {showDetails ? displayPin : "••••"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 py-3.5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-medium">Spent this month</span>
            <span className="text-sm text-muted-foreground">
              <Money amount={card.spentThisMonth} currency={card.currency} whole className="font-medium text-foreground" />{" "}
              of <Money amount={card.monthlyLimit} currency={card.currency} whole />
            </span>
          </div>
          <Progress value={usedShare * 100} aria-label="Share of monthly limit used" />
        </div>
      </CardContent>
    </Card>
  );
}
