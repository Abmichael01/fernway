import { describe, expect, it } from "vitest";
import { generatePassword } from "./password";

describe("generatePassword", () => {
  it("makes four groups of four readable characters", () => {
    expect(generatePassword()).toMatch(/^[a-km-zA-HJ-NP-Z2-9]{4}(-[a-km-zA-HJ-NP-Z2-9]{4}){3}$/);
  });

  it("always passes the password rules (10+ chars, a letter and a digit)", () => {
    for (let index = 0; index < 200; index++) {
      const password = generatePassword();
      expect(password.length).toBeGreaterThanOrEqual(10);
      expect(password).toMatch(/[A-Za-z]/);
      expect(password).toMatch(/\d/);
    }
  });

  it("does not repeat", () => {
    const seen = new Set(Array.from({ length: 500 }, () => generatePassword()));
    expect(seen.size).toBe(500);
  });
});
