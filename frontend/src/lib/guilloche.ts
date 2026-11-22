/**
 * Guilloché rosettes: the fine interlaced line patterns engraved on banknotes
 * and cheques. Each ring is an epitrochoid traced until it closes.
 */

export interface GuillocheRing {
  /** Radius of the fixed circle. */
  R: number;
  /** Radius of the rolling circle. */
  r: number;
  /** Pen distance from the rolling circle's centre. */
  d: number;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Builds an SVG path for one closed epitrochoid centred on (0, 0). */
export function epitrochoidPath({ R, r, d }: GuillocheRing, segmentsPerLobe = 14): string {
  const divisor = gcd(R, r);
  const loops = r / divisor;
  const lobes = R / divisor;
  const steps = Math.max(120, lobes * segmentsPerLobe);
  const total = 2 * Math.PI * loops;
  const k = (R + r) / r;

  let path = "";
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * total;
    const x = (R + r) * Math.cos(t) - d * Math.cos(k * t);
    const y = (R + r) * Math.sin(t) - d * Math.sin(k * t);
    path += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${path}Z`;
}

/** Outer extent of a ring, used to fit rosettes into a viewBox. */
export function ringRadius({ R, r, d }: GuillocheRing): number {
  return R + r + d;
}
