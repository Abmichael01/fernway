import { describe, expect, it } from "vitest";
import { formatDayLabel, groupByDay } from "./dates";

const now = new Date(2026, 10, 7, 12, 0);

describe("formatDayLabel", () => {
  it("names recent days", () => {
    expect(formatDayLabel(new Date(2026, 10, 7, 8).toISOString(), now)).toBe("Today");
    expect(formatDayLabel(new Date(2026, 10, 6, 23).toISOString(), now)).toBe("Yesterday");
    expect(formatDayLabel(new Date(2026, 10, 4, 9).toISOString(), now)).toBe("Wednesday");
  });

  it("uses a date beyond a week", () => {
    expect(formatDayLabel(new Date(2026, 9, 20).toISOString(), now)).toMatch(/Oct 20/);
  });
});

describe("groupByDay", () => {
  it("groups consecutive items by calendar day", () => {
    const items = [
      { id: "a", createdAt: new Date(2026, 10, 7, 10).toISOString() },
      { id: "b", createdAt: new Date(2026, 10, 7, 9).toISOString() },
      { id: "c", createdAt: new Date(2026, 10, 6, 18).toISOString() },
    ];
    const groups = groupByDay(items, now);
    expect(groups.map((group) => [group.label, group.items.map((item) => item.id)])).toEqual([
      ["Today", ["a", "b"]],
      ["Yesterday", ["c"]],
    ]);
  });
});
