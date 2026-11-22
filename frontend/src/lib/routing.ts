const WEIGHTS = [3, 7, 1, 3, 7, 1, 3, 7, 1];

/** ABA routing number check: 9 digits with a valid weighted checksum. */
export function isValidRoutingNumber(value: string): boolean {
  if (!/^\d{9}$/.test(value)) return false;
  const sum = [...value].reduce((total, digit, index) => total + Number(digit) * WEIGHTS[index], 0);
  return sum % 10 === 0;
}

export function maskAccountNumber(accountNumber: string): string {
  return `••${accountNumber.slice(-4)}`;
}
