import { z } from "zod";
import { adminWithdrawalRejectSchema } from "@/schemas/invest";
import { handler, HttpError, parseBody, requireAdmin } from "@/server/http";
import { adminWithdrawal } from "@/server/selectors/invest";
import { decideWithdrawal } from "@/server/services/invest";

export const POST = handler(async (request, { params }: RouteContext<"/api/admin/invest/withdrawals/[id]/reject">) => {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) throw new HttpError(404, "That withdrawal doesn't exist.");
  const body = await parseBody(request, adminWithdrawalRejectSchema);
  await decideWithdrawal(id, { status: "rejected", reason: body.reason, adminId: admin.id });
  return adminWithdrawal(id);
});
