/** No look-alike characters (0/O, 1/l/I), so a password read aloud or retyped survives. */
const LETTERS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const ALPHABET = LETTERS + DIGITS;

function randomIndex(max: number): number {
  // Rejection sampling keeps every character equally likely.
  const limit = Math.floor(256 / max) * max;
  const byte = new Uint8Array(1);
  do crypto.getRandomValues(byte);
  while (byte[0] >= limit);
  return byte[0] % max;
}

/**
 * A strong, readable password such as `Fw7k-Qx2m-9tWp-Rb4n` (16 random characters, ~90 bits).
 * Always contains a letter and a digit, so it passes the sign-in password rules.
 * Call only in the browser, from an event handler (never during render).
 */
export function generatePassword(groups = 4, size = 4): string {
  for (;;) {
    const chars = Array.from({ length: groups * size }, () => ALPHABET[randomIndex(ALPHABET.length)]);
    const text = chars.join("");
    if (/\d/.test(text) && /[A-Za-z]/.test(text)) {
      return Array.from({ length: groups }, (_, index) => text.slice(index * size, index * size + size)).join("-");
    }
  }
}
