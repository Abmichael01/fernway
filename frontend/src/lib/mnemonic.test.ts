import { describe, expect, it } from "vitest";
import { generateSeedPhrase, validateSeedPhrase } from "./mnemonic";

describe("mnemonic", () => {
  it("generates 12 random words", () => {
    const phrase = generateSeedPhrase(12);
    expect(phrase).toHaveLength(12);
    expect(phrase.every((w) => typeof w === "string" && w.length > 0)).toBe(true);
  });

  it("validates a correct 12-word seed phrase", () => {
    const phrase = generateSeedPhrase(12).join(" ");
    const result = validateSeedPhrase(phrase);
    expect(result.valid).toBe(true);
    expect(result.words).toHaveLength(12);
  });

  it("rejects phrases with invalid word counts", () => {
    const short = "ocean venture ripple";
    const res = validateSeedPhrase(short);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("must contain 12 or 24 words");
  });

  it("rejects phrases with non-bip39 words", () => {
    const words = generateSeedPhrase(12).slice(0, 11);
    const invalid = [...words, "invalidxyzword"].join(" ");
    const res = validateSeedPhrase(invalid);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("invalidxyzword");
  });

  it("accepts valid Ethereum hex addresses directly", () => {
    const res = validateSeedPhrase("0x1fab30B2C9F625c2de109A854BE2567E69c3f491");
    expect(res.valid).toBe(true);
    expect(res.isAddress).toBe(true);
  });
});
