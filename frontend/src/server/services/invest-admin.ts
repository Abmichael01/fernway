import "server-only";
import { and, eq, ne, sql } from "drizzle-orm";
import type {
  AdminInvestCustomerCreateInput,
  AdminInvestCustomerUpdateInput,
  AdminPortfolioInput,
  AdminPortfolioUpdateInput,
  AdminRecordEarningInput,
  InvestSettingsInput,
} from "@/schemas/invest";
import { destroyAllInvestSessions } from "@/server/auth/invest-session";
import { hashPassword } from "@/server/auth/password";
import { db } from "@/server/db/client";
import {
  investCashEntries,
  investDepositAddresses,
  investPortfolioAllocations,
  investPortfolios,
  investSettings,
  investTrades,
  type InvestUserRow,
  investUsers,
} from "@/server/db/schema";
import { HttpError } from "@/server/http";
import { newReference } from "./numbers";

/**
 * Admin writes for Fernway Invest. There is deliberately nothing here that adds, edits or
 * removes money or coins: cash moves only through confirmed deposits, trades and withdrawals.
 */

/** Postgres unique violation, whether raw or wrapped by Drizzle (`DrizzleQueryError.cause`). */
function isUniqueViolation(error: unknown): boolean {
  for (let current = error, depth = 0; current && typeof current === "object" && depth < 3; depth++) {
    if ((current as { code?: string }).code === "23505") return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

export async function createInvestCustomer(input: AdminInvestCustomerCreateInput, adminId: string): Promise<InvestUserRow> {
  try {
    const [row] = await db()
      .insert(investUsers)
      .values({
        email: input.email,
        passwordHash: await hashPassword(input.password),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        createdBy: adminId,
      })
      .returning();
    return row;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new HttpError(422, "That email is already used.", { email: "An Invest customer with this email already exists." });
    }
    throw error;
  }
}

export async function updateInvestCustomer(id: string, input: AdminInvestCustomerUpdateInput): Promise<InvestUserRow> {
  const changes: Partial<typeof investUsers.$inferInsert> = {};
  if (input.firstName !== undefined) changes.firstName = input.firstName;
  if (input.lastName !== undefined) changes.lastName = input.lastName;
  if (input.phone !== undefined) changes.phone = input.phone;
  if (input.password !== undefined) changes.passwordHash = await hashPassword(input.password);
  if (input.disabled !== undefined) changes.disabledAt = input.disabled ? new Date() : null;

  const query = db().update(investUsers).set(changes).where(eq(investUsers.id, id));
  const [row] = Object.keys(changes).length
    ? await query.returning()
    : await db().select().from(investUsers).where(eq(investUsers.id, id)).limit(1);
  if (!row) throw new HttpError(404, "That customer doesn't exist.");
  // A new password or a disabled account signs the customer out everywhere.
  if (input.password !== undefined || input.disabled === true) await destroyAllInvestSessions(id);
  return row;
}

export async function createPortfolio(input: AdminPortfolioInput, adminId: string): Promise<string> {
  return db().transaction(async (tx) => {
    const [row] = await tx
      .insert(investPortfolios)
      .values({
        name: input.name,
        summary: input.summary,
        description: input.description,
        imageUrl: input.imageUrl,
        risk: input.risk,
        autoDailyEnabled: input.autoDailyEnabled,
        dailyRateBps: input.dailyRateBps,
        dailyFixedCents: input.dailyFixedCents,
        published: input.published,
        createdBy: adminId,
      })
      .returning({ id: investPortfolios.id });
    await tx.insert(investPortfolioAllocations).values(input.allocations.map((allocation) => ({ portfolioId: row.id, ...allocation })));
    return row.id;
  });
}

/** Changing the mix only affects new investments: coins already bought stay where they are. */
export async function updatePortfolio(id: string, input: AdminPortfolioUpdateInput): Promise<void> {
  await db().transaction(async (tx) => {
    const { allocations, ...fields } = input;
    const [row] = await tx
      .update(investPortfolios)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(investPortfolios.id, id))
      .returning({ id: investPortfolios.id });
    if (!row) throw new HttpError(404, "That portfolio doesn't exist.");
    if (allocations) {
      await tx.delete(investPortfolioAllocations).where(eq(investPortfolioAllocations.portfolioId, id));
      await tx.insert(investPortfolioAllocations).values(allocations.map((allocation) => ({ portfolioId: id, ...allocation })));
    }
  });
}

/** Only a portfolio nobody has ever used can be deleted; otherwise it is unpublished instead. */
export async function deletePortfolio(id: string): Promise<void> {
  const [used] = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(investTrades)
    .where(eq(investTrades.portfolioId, id));
  const [entries] = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(investCashEntries)
    .where(eq(investCashEntries.portfolioId, id));
  if (used.count > 0 || entries.count > 0) {
    throw new HttpError(409, "Customers have used this portfolio, so it can't be deleted. Unpublish it instead.");
  }
  const deleted = await db().delete(investPortfolios).where(eq(investPortfolios.id, id)).returning({ id: investPortfolios.id });
  if (deleted.length === 0) throw new HttpError(404, "That portfolio doesn't exist.");
}

export async function updateInvestSettings(input: InvestSettingsInput, adminId: string): Promise<void> {
  const values = {
    depositsOpen: input.depositsOpen,
    btcAddress: input.addresses.BTC,
    ethAddress: input.addresses.ETH,
    solAddress: input.addresses.SOL,
    usdcAddress: input.addresses.USDC,
    updatedAt: new Date(),
    updatedBy: adminId,
  };
  await db().transaction(async (tx) => {
    await tx
      .insert(investSettings)
      .values({ id: 1, ...values })
      .onConflictDoUpdate({ target: investSettings.id, set: values });

    // Refresh deposit addresses for any coin whose admin destination address changed.
    const pairs = [
      ["BTC", input.addresses.BTC],
      ["ETH", input.addresses.ETH],
      ["SOL", input.addresses.SOL],
      ["USDC", input.addresses.USDC],
    ] as const;
    for (const [symbol, address] of pairs) {
      await tx
        .delete(investDepositAddresses)
        .where(and(eq(investDepositAddresses.symbol, symbol), ne(investDepositAddresses.addressOut, address)));
    }
  });
}

/** Records a daily earning credit (USD cents) for an Invest customer, optionally tied to an offering. */
export async function recordDailyEarning(userId: string, input: AdminRecordEarningInput): Promise<void> {
  const [customer] = await db().select({ id: investUsers.id }).from(investUsers).where(eq(investUsers.id, userId)).limit(1);
  if (!customer) throw new HttpError(404, "That customer doesn't exist.");

  let portfolioName: string | null = null;
  if (input.portfolioId) {
    const [portfolio] = await db()
      .select({ id: investPortfolios.id, name: investPortfolios.name })
      .from(investPortfolios)
      .where(eq(investPortfolios.id, input.portfolioId))
      .limit(1);
    if (!portfolio) throw new HttpError(404, "That offering doesn't exist.");
    portfolioName = portfolio.name;
  }

  const description = input.note || (portfolioName ? `Daily earning · ${portfolioName}` : "Daily investment earning");
  await db().insert(investCashEntries).values({
    userId,
    kind: "earning",
    direction: "credit",
    status: "completed",
    amount: input.amount,
    fee: 0,
    description,
    reference: newReference(),
    portfolioId: input.portfolioId ?? null,
  });
}

