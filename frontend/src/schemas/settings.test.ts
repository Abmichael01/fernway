import { describe, expect, it } from "vitest";
import { siteSettingsSchema } from "./settings";

describe("siteSettingsSchema", () => {
  it("accepts a real address or an empty one (which hides contact links)", () => {
    expect(siteSettingsSchema.safeParse({ supportEmail: "help@example.org" }).success).toBe(true);
    expect(siteSettingsSchema.safeParse({ supportEmail: "" }).success).toBe(true);
  });

  it("rejects something that isn't an email", () => {
    expect(siteSettingsSchema.safeParse({ supportEmail: "support at fernway" }).success).toBe(false);
  });
});

describe("siteSettingsSchema tidying", () => {
  it("trims spaces and lower-cases the address", () => {
    expect(siteSettingsSchema.parse({ supportEmail: "  Help@Example.ORG " }).supportEmail).toBe("help@example.org");
  });
});
