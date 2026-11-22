import { generateMnemonic, english } from "viem/accounts";

/**
 * Standard BIP-39 English wordlist.
 */
export const WORDLIST: readonly string[] = english;

/**
 * Generates a valid BIP-39 mnemonic seed phrase with valid checksum bits.
 * Default is 12 words (128-bit entropy + 4-bit checksum).
 */
export function generateSeedPhrase(wordCount: 12 | 24 = 12): string[] {
  const strength = wordCount === 24 ? 256 : 128;
  const mnemonic = generateMnemonic(english, strength);
  return mnemonic.split(" ");
}

/**
 * Validates a user-entered recovery phrase or Ethereum address.
 */
export function validateSeedPhrase(phrase: string): {
  valid: boolean;
  error?: string;
  words?: string[];
  isAddress?: boolean;
} {
  const trimmed = phrase.trim();
  if (!trimmed) {
    return { valid: false, error: "Please enter a recovery phrase or address." };
  }

  // Allow direct Ethereum address (0x...)
  if (/^0x[a-fA-F0-9]{40}$/i.test(trimmed)) {
    return { valid: true, isAddress: true };
  }

  const cleaned = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  if (cleaned.length !== 12 && cleaned.length !== 24) {
    return {
      valid: false,
      error: `Secret phrase must contain 12 or 24 words (or a valid Ethereum address). Got ${cleaned.length} words.`,
    };
  }

  const invalidWords = cleaned.filter((w) => !(english as readonly string[]).includes(w));
  if (invalidWords.length > 0) {
    return {
      valid: false,
      error: `Invalid word(s): ${invalidWords.slice(0, 3).join(", ")}. Please check spelling.`,
    };
  }

  return { valid: true, words: cleaned };
}
