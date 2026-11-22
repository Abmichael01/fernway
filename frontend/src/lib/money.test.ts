import { describe, expect, it } from "vitest";
import { formatMoney, parseMajorAmount, splitMoney } from "./money";

describe("formatMoney", () => {
  it("formats dollars from cents", () => {
    expect(formatMoney(864_237, "USD")).toBe("$8,642.37");
  });

  it("signs credits and debits with a true minus", () => {
    expect(formatMoney(385_000, "USD", { signed: true })).toBe("+$3,850.00");
    expect(formatMoney(-2_500, "USD", { signed: true })).toBe("−$25.00");
  });

  it("drops the fraction for whole amounts", () => {
    expect(formatMoney(100_000, "USD", { whole: true })).toBe("$1,000");
  });
});

describe("splitMoney", () => {
  it("separates symbol, whole and fraction", () => {
    expect(splitMoney(3_282_237, "USD")).toEqual({ sign: "", symbol: "$", whole: "32,822", fraction: "37" });
  });
});

describe("parseMajorAmount", () => {
  it.each([
    ["25,000", 2_500_000],
    ["2500.5", 250_050],
    ["0.05", 5],
    [" 1 000 ", 100_000],
  ])("parses %s", (input, expected) => {
    expect(parseMajorAmount(input)).toBe(expected);
  });

  it.each(["", "abc", "12.345", "-50", "1.2.3"])("rejects %s", (input) => {
    expect(parseMajorAmount(input)).toBeNull();
  });
});
