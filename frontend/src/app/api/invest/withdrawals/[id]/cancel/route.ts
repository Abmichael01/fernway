import { z } from "zod";
import { handler, HttpError, requireInvestUser } from "@/server/http";
import { withdrawalById } from "@/server/selectors/invest";
import { decideWithdrawal } from "@/server/services/invest";

export const POST = handler(async (_request, { params }: RouteContext<"/api/invest/withdrawals/[id]/cancel">) => {
  const user = await requireInvestUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) throw new HttpError(404, "That withdrawal doesn't exist.");
  await decideWithdrawal(id, { status: "cancelled", userId: user.id });
  return withdrawalById(id);
});
