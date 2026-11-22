import { createCardSchema } from "@/schemas/card";
import { getDjangoSessionToken } from "@/server/auth/session";
import { handler, HttpError, parseBody, requireUser } from "@/server/http";
import { cardsForUser } from "@/server/selectors/banking";
import { issueCard } from "@/server/services/ledger";
import { getSharpToolzApiBases } from "@/server/sharptoolz-api";
import type { PaymentCard } from "@/types/banking";

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

function mapDjangoCard(card: DjangoCardResponse, accountId: string): PaymentCard {
  return {
    id: card.id,
    accountId,
    label: card.label,
    brand: card.brand || "visa",
    kind: "physical",
    cardNumber: card.card_number,
    cvv: card.cvv,
    pin: card.pin,
    last4: card.last4,
    expiry: card.expiry,
    holderName: card.holder_name,
    frozen: Boolean(card.is_frozen),
    onlinePayments: Boolean(card.online_payments),
    currency: "USD",
    monthlyLimit: card.monthly_limit,
    spentThisMonth: 0,
  };
}

export const GET = handler(async () => cardsForUser((await requireUser()).id));

export const POST = handler(async (request) => {
  const user = await requireUser();
  const input = await parseBody(request, createCardSchema);
  const djangoToken = await getDjangoSessionToken();

  if (djangoToken) {
    let lastDetail = "Unable to order card right now. Please try again.";
    for (const apiBase of getSharpToolzApiBases()) {
      try {
        const res = await fetch(`${apiBase}/fernway/client/cards/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Fernway-Token": djangoToken,
          },
          body: JSON.stringify({
            account_id: input.accountId,
            label: input.label,
            monthly_limit: input.monthlyLimit,
          }),
          cache: "no-store",
        });
        const body = (await res.json().catch(() => ({}))) as DjangoCardResponse & { detail?: string };
        if (res.ok) {
          return {
            success: true,
            card: mapDjangoCard(body, input.accountId),
          };
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

  const card = await issueCard(user.id, input);
  return {
    success: true,
    card,
  };
});
