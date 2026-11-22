import "server-only";
import { eq } from "drizzle-orm";
import type { CustomerCreateInput, CustomerUpdateInput } from "@/schemas/admin";
import { hashPassword } from "@/server/auth/password";
import { db } from "@/server/db/client";
import { accounts, cards, sessions, type UserRow, users } from "@/server/db/schema";
import { HttpError } from "@/server/http";
import { cardExpiry, DEFAULT_ROUTING_NUMBER, newAccountNumber, newCardLast4 } from "./numbers";

const DEFAULT_SAVINGS_APY_BPS = 410;
const DEFAULT_CARD_LIMIT = 5_000_00;

/** Postgres unique violation, found anywhere in the error's cause chain (Drizzle wraps driver errors). */
function isUniqueViolation(error: unknown): boolean {
  for (let current = error; typeof current === "object" && current !== null; current = (current as { cause?: unknown }).cause) {
    if ("code" in current && current.code === "23505") return true;
  }
  return false;
}

/**
 * Creates a customer with the accounts and card the admin asked for, all or nothing.
 * New accounts start at $0: money only ever arrives as ledger entries.
 */
export async function createCustomer(input: CustomerCreateInput): Promise<UserRow> {
  const passwordHash = await hashPassword(input.password);
  try {
    return await db().transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          role: "customer",
          email: input.email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          addressLine1: input.addressLine1,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
        })
        .returning();

      let checkingId: string | null = null;
      if (input.openChecking) {
        const [checking] = await tx
          .insert(accounts)
          .values({
            userId: user.id,
            type: "checking",
            name: "Everyday checking",
            accountNumber: newAccountNumber(),
            routingNumber: DEFAULT_ROUTING_NUMBER,
          })
          .returning({ id: accounts.id });
        checkingId = checking.id;
      }
      if (input.openSavings) {
        await tx.insert(accounts).values({
          userId: user.id,
          type: "savings",
          name: "High-yield savings",
          accountNumber: newAccountNumber(),
          routingNumber: DEFAULT_ROUTING_NUMBER,
          apyBps: DEFAULT_SAVINGS_APY_BPS,
        });
      }
      if (input.issueDebitCard) {
        if (!checkingId) {
          throw new HttpError(422, "A debit card needs a checking account.", {
            issueDebitCard: "Open a checking account to issue a debit card.",
          });
        }
        await tx.insert(cards).values({
          userId: user.id,
          accountId: checkingId,
          label: "Debit card",
          kind: "physical",
          last4: newCardLast4(),
          expiry: cardExpiry(),
          holderName: `${input.firstName} ${input.lastName}`.toUpperCase(),
          monthlyLimit: DEFAULT_CARD_LIMIT,
        });
      }
      return user;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new HttpError(422, "That email is already in use.", { email: "A customer already uses this email." });
    }
    throw error;
  }
}

export async function updateCustomer(userId: string, input: CustomerUpdateInput): Promise<UserRow> {
  try {
    return await db().transaction(async (tx) => {
      const [user] = await tx
        .update(users)
        .set({
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          addressLine1: input.addressLine1,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          theme: input.theme ?? undefined,
          disabledAt: input.disabled ? new Date() : null,
        })
        .where(eq(users.id, userId))
        .returning();
      if (!user || user.role !== "customer") throw new HttpError(404, "That customer doesn't exist.");
      // Disabling signs the customer out everywhere.
      if (input.disabled) await tx.delete(sessions).where(eq(sessions.userId, userId));
      return user;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new HttpError(422, "That email is already in use.", { email: "A customer already uses this email." });
    }
    throw error;
  }
}

export async function setCustomerPassword(userId: string, password: string): Promise<void> {
  const passwordHash = await hashPassword(password);
  await db().transaction(async (tx) => {
    const [user] = await tx.update(users).set({ passwordHash }).where(eq(users.id, userId)).returning({ id: users.id });
    if (!user) throw new HttpError(404, "That customer doesn't exist.");
    await tx.delete(sessions).where(eq(sessions.userId, userId));
  });
}
