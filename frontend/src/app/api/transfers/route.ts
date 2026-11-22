import { simpleTransferInputSchema } from "@/schemas/transfer";
import { getDjangoSessionToken } from "@/server/auth/session";
import { handler, HttpError, parseBody, requireUser } from "@/server/http";
import { getSharpToolzApiBases } from "@/server/sharptoolz-api";
import type { Transaction } from "@/types/banking";

interface DjangoTxResponse {
  id: string;
  account_id?: string;
  direction: Transaction["direction"];
  amount: number;
  fee?: number;
  counterparty: string;
  counterparty_detail?: string | null;
  narration?: string;
  category?: Transaction["category"];
  channel?: Transaction["channel"];
  status?: Transaction["status"];
  reference?: string;
  occurred_at: string;
}

export const POST = handler(async (request) => {
  await requireUser();
  const input = await parseBody(request, simpleTransferInputSchema);
  const djangoToken = await getDjangoSessionToken();

  let lastDetail = "Unable to submit transfer right now. Please try again.";
  for (const apiBase of getSharpToolzApiBases()) {
    try {
      const res = await fetch(`${apiBase}/fernway/client/transfers/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(djangoToken ? { "X-Fernway-Token": djangoToken } : {}),
        },
        body: JSON.stringify({
          recipient_name: input.recipientName,
          bank_name: input.bankName,
          account_number: input.accountNumber,
          routing_number: input.routingNumber || "",
          amount_cents: input.amount,
          note: input.memo || "",
          transaction_pin: input.pin,
        }),
        cache: "no-store",
      });

      const body = (await res.json().catch(() => ({}))) as DjangoTxResponse & { detail?: string };
      if (res.ok) {
        const mapped: Transaction = {
          id: body.id,
          accountId: body.account_id || "",
          direction: body.direction || "debit",
          amount: body.amount,
          fee: body.fee || 0,
          currency: "USD",
          counterparty: body.counterparty,
          ...(body.counterparty_detail ? { counterpartyDetail: body.counterparty_detail } : {}),
          narration: body.narration || "",
          category: body.category || "transfer",
          channel: body.channel || "wire",
          status: body.status || "pending",
          reference: body.reference || "TRF-PENDING",
          createdAt: body.occurred_at || new Date().toISOString(),
        };
        return mapped;
      }

      if (res.status >= 400 && res.status < 500) {
        throw new HttpError(res.status, body.detail || lastDetail);
      }
      if (body.detail) lastDetail = body.detail;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      // Try next port
    }
  }

  throw new HttpError(503, lastDetail);
});
