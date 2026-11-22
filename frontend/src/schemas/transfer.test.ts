import { describe, expect, it } from "vitest";
import { isValidRoutingNumber } from "@/lib/routing";
import { transferSchema } from "./transfer";

const valid = {
  fromAccountId: "acc_checking",
  recipientName: "Alex Kim",
  routingNumber: "021000021",
  accountNumber: "7729104458",
  accountType: "checking" as const,
  method: "ach" as const,
  amount: "250",
  memo: "",
  saveRecipient: true,
};

function firstError(values: Partial<typeof valid>) {
  const result = transferSchema.safeParse({ ...valid, ...values });
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe("isValidRoutingNumber", () => {
  it("accepts checksum-valid ABA numbers", () => {
    expect(isValidRoutingNumber("021000021")).toBe(true);
    expect(isValidRoutingNumber("072414255")).toBe(true);
  });

  it("rejects bad checksums and lengths", () => {
    expect(isValidRoutingNumber("021000022")).toBe(false);
    expect(isValidRoutingNumber("12345")).toBe(false);
  });
});

describe("transferSchema", () => {
  it("accepts a complete transfer", () => {
    expect(transferSchema.safeParse(valid).success).toBe(true);
  });

  it("explains an invalid routing number", () => {
    expect(firstError({ routingNumber: "021000022" })).toMatch(/isn't a valid routing number/);
  });

  it("rejects malformed and too-small amounts", () => {
    expect(firstError({ amount: "12.345" })).toMatch(/Enter an amount like/);
    expect(firstError({ amount: "0.50" })).toBe("The smallest transfer is $1.");
  });
});
