import { z } from "zod";
import { adminWithdrawalPaySchema } from "@/schemas/invest";
import { handler, HttpError, parseBody, requireAdmin } from "@/server/http";
import { adminWithdrawal } from "@/server/selectors/invest";
import { decideWithdrawal } from "@/server/services/invest";

export const POST = handler(async (request, { params }: RouteContext<"/api/admin/invest/withdrawals/[id]/pay">) => {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) throw new HttpError(404, "That withdrawal doesn't exist.");
  const body = await parseBody(request, adminWithdrawalPaySchema);
  await decideWithdrawal(id, { status: "paid", txid: body.txid, adminId: admin.id });
  return adminWithdrawal(id);
});
