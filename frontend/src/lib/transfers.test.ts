import { describe, expect, it } from "vitest";
import { arrivalLabel, quoteTransfer, TRANSFER_FEES } from "./transfers";

describe("quoteTransfer", () => {
  const wednesday = new Date(2026, 10, 11, 10);

  it("adds the speed fee to the total", () => {
    expect(quoteTransfer("ach", 25_000, wednesday)).toMatchObject({ fee: 0, total: 25_000 });
    expect(quoteTransfer("same_day_ach", 25_000, wednesday)).toMatchObject({ fee: 200, total: 25_200 });
    expect(quoteTransfer("wire", 25_000, wednesday)).toMatchObject({ fee: 1_500, total: 26_500 });
  });

  it("matches the published fees", () => {
    expect(TRANSFER_FEES).toEqual({ ach: 0, same_day_ach: 200, wire: 1_500 });
  });
});

describe("arrivalLabel", () => {
  it("counts standard ACH in business days", () => {
    expect(arrivalLabel("ach", new Date(2026, 10, 13, 10))).toBe("By Tue, Nov 17"); // Friday → Tuesday
  });

  it("moves same-day ACH to the next business day at weekends", () => {
    expect(arrivalLabel("same_day_ach", new Date(2026, 10, 14, 10))).toBe("Next business day");
    expect(arrivalLabel("same_day_ach", new Date(2026, 10, 11, 10))).toBe("Today by 5 p.m. ET");
  });
});
