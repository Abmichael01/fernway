import type { PaymentCard } from "@/types/banking";
import type { CreateCardInput } from "@/schemas/card";
import { apiRequest } from "./client";

export function getCards(): Promise<PaymentCard[]> {
  return apiRequest<PaymentCard[]>("/cards");
}

export function createCard(input: CreateCardInput): Promise<{ success: boolean; card: PaymentCard }> {
  return apiRequest<{ success: boolean; card: PaymentCard }>("/cards", {
    method: "POST",
    body: input,
  });
}

export type CardSettingsUpdate = Partial<Pick<PaymentCard, "frozen" | "onlinePayments">>;

export function updateCardSettings(cardId: string, update: CardSettingsUpdate): Promise<PaymentCard> {
  return apiRequest<PaymentCard>(`/cards/${encodeURIComponent(cardId)}`, { method: "PATCH", body: update });
}
