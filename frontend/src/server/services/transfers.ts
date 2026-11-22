import "server-only";
import type { z } from "zod";
import { TRANSFER_FEES, WIRE_MINIMUM } from "@/lib/transfers";
import type { internalTransferInputSchema, transferInputSchema } from "@/schemas/transfer";
import { db } from "@/server/db/client";
import { recipients, type TransactionRow, transactions } from "@/server/db/schema";
import { HttpError } from "@/server/http";
import { findBank } from "./banks";
import { assertAvailable, lockAccount, type Tx } from "./ledger";
import { newReference } from "./numbers";

type TransferInput = z.infer<typeof transferInputSchema>;
type InternalTransferInput = z.infer<typeof internalTransferInputSchema>;

/** Locks an account and proves it belongs to this customer. Someone else's id reads as "not found". */
async function lockOwnAccount(tx: Tx, accountId: string, userId: string, field: string) {
  const account = await lockAccount(tx, accountId).catch(() => null);
  if (!account || account.userId !== userId) {
    throw new HttpError(422, "Choose one of your accounts.", { [field]: "Choose one of your accounts." });
  }
  return account;
}

/**
 * Sends money to an account at another bank. The debit (amount + speed fee) is written to the
 * ledger at once; standard ACH shows as pending until it settles.
 */
export async function sendTransfer(userId: string, input: TransferInput): Promise<TransactionRow> {
  const bankName = findBank(input.routingNumber);
  if (!bankName) {
    throw new HttpError(422, "We couldn't find that bank.", {
      routingNumber: "We couldn't find a bank with that routing number. Check it and try again.",
    });
  }
  if (input.method === "wire" && input.amount < WIRE_MINIMUM) {
    throw new HttpError(422, "Wire minimum not met.", { amount: "Wires start at $100. Use ACH for smaller amounts." });
  }
  const fee = TRANSFER_FEES[input.method];

  return db().transaction(async (tx) => {
    const account = await lockOwnAccount(tx, input.fromAccountId, userId, "fromAccountId");
    const [row] = await tx
      .insert(transactions)
      .values({
        accountId: account.id,
        direction: "debit",
        amount: input.amount,
        fee,
        counterparty: input.recipientName,
        counterpartyDetail: `${bankName} ••${input.accountNumber.slice(-4)}`,
        narration: input.memo || "Transfer",
        category: "transfer",
        channel: input.method === "wire" ? "wire" : "ach",
        status: input.method === "ach" ? "pending" : "completed",
        reference: newReference(),
      })
      .returning();
    await assertAvailable(
      tx,
      account.id,
      (available) => `That's more than the ${available} available in ${account.name}, including fees.`,
      input.amount + fee,
    );

    if (input.saveRecipient) {
      await tx
        .insert(recipients)
        .values({
          userId,
          name: input.recipientName,
          bankName,
          routingNumber: input.routingNumber,
          accountNumber: input.accountNumber,
          accountType: input.accountType,
        })
        .onConflictDoNothing();
    }
    return row;
  });
}

/** Moves money between two of the customer's own accounts. Instant and free. Returns the debit. */
export async function moveBetweenAccounts(userId: string, input: InternalTransferInput): Promise<TransactionRow> {
  return db().transaction(async (tx) => {
    // Lock in a fixed order so two opposite moves can't deadlock.
    const [firstId, secondId] = [input.fromAccountId, input.toAccountId].sort();
    const first = await lockOwnAccount(tx, firstId, userId, firstId === input.fromAccountId ? "fromAccountId" : "toAccountId");
    const second = await lockOwnAccount(tx, secondId, userId, secondId === input.fromAccountId ? "fromAccountId" : "toAccountId");
    const from = first.id === input.fromAccountId ? first : second;
    const to = from === first ? second : first;

    const base = {
      amount: input.amount,
      fee: 0,
      narration: "Transfer between accounts",
      category: "savings" as const,
      channel: "internal" as const,
      status: "completed" as const,
      occurredAt: new Date(),
    };
    await tx.insert(transactions).values({ ...base, accountId: to.id, direction: "credit", counterparty: from.name, reference: newReference() });
    const [debit] = await tx
      .insert(transactions)
      .values({ ...base, accountId: from.id, direction: "debit", counterparty: to.name, reference: newReference() })
      .returning();
    await assertAvailable(tx, from.id, (available) => `${from.name} has ${available} available.`, input.amount);
    return debit;
  });
}
