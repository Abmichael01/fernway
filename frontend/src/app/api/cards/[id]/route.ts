import { z } from "zod";
import { getDjangoSessionToken } from "@/server/auth/session";
import { handler, HttpError, parseBody, requireUser } from "@/server/http";
import { toCard } from "@/server/mappers";
import { cardsForUser } from "@/server/selectors/banking";
import { updateCardSettings } from "@/server/services/ledger";
import { getSharpToolzApiBases } from "@/server/sharptoolz-api";
import type { PaymentCard } from "@/types/banking";

const settingsSchema = z
  .object({ frozen: z.boolean().optional(), onlinePayments: z.boolean().optional() })
  .refine((value) => value.frozen !== undefined || value.onlinePayments !== undefined, "Nothing to change.");

interface DjangoCardResponse {
  id: string;
  label: string;
  kind: "physical" | "virtual";
  brand: "visa" | "mastercard";
  card_number?: string;
  last4: string;
  expiry: string;
  cvv?: string;
  pin?: string;
  holder_name: string;
  monthly_limit: number;
  is_frozen: boolean;
  online_payments: boolean;
}

export const PATCH = handler(async (request, context: RouteContext<"/api/cards/[id]">) => {
  const { id: userId } = await requireUser();
  const { id } = await context.params;
  const input = await parseBody(request, settingsSchema);
  const djangoToken = await getDjangoSessionToken();

  if (djangoToken) {
    let lastDetail = "Unable to update card settings right now.";
    for (const apiBase of getSharpToolzApiBases()) {
      try {
        const res = await fetch(`${apiBase}/fernway/client/cards/${encodeURIComponent(id)}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Fernway-Token": djangoToken,
          },
          body: JSON.stringify(input),
          cache: "no-store",
        });
        const body = (await res.json().catch(() => ({}))) as DjangoCardResponse & { detail?: string };
        if (res.ok) {
          const existing = (await cardsForUser(userId)).find((item) => item.id === body.id);
          const mapped: PaymentCard = {
            id: body.id,
            accountId: existing?.accountId || "",
            label: body.label,
            brand: body.brand || "visa",
            kind: "physical",
            cardNumber: body.card_number,
            cvv: body.cvv,
            pin: body.pin,
            last4: body.last4,
            expiry: body.expiry,
            holderName: body.holder_name,
            frozen: Boolean(body.is_frozen),
            onlinePayments: Boolean(body.online_payments),
            currency: "USD",
            monthlyLimit: body.monthly_limit,
            spentThisMonth: existing?.spentThisMonth ?? 0,
          };
          return mapped;
        }
        if (res.status >= 400 && res.status < 500) {
          throw new HttpError(res.status, body.detail || lastDetail);
        }
        if (body.detail) lastDetail = body.detail;
      } catch (error) {
        if (error instanceof HttpError) throw error;
      }
    }
    throw new HttpError(503, lastDetail);
  }

  const card = await updateCardSettings(userId, id, input);
  const withSpend = (await cardsForUser(userId)).find((item) => item.id === card.id);
  return withSpend ?? toCard(card, 0);
});
