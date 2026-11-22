import { useId } from "react";
import { cn } from "@/lib/utils";
import { epitrochoidPath, type GuillocheRing, ringRadius } from "@/lib/guilloche";

interface Layer {
  ring: GuillocheRing;
  /** Rotated copies of the ring; overlapping copies produce the moiré. */
  copies: number;
  strokeWidth: number;
  opacity: number;
}

const presets = {
  plate: [
    { ring: { R: 132, r: 11, d: 44 }, copies: 3, strokeWidth: 0.55, opacity: 0.9 },
    { ring: { R: 96, r: 7, d: 30 }, copies: 2, strokeWidth: 0.5, opacity: 0.7 },
    { ring: { R: 56, r: 5, d: 22 }, copies: 2, strokeWidth: 0.45, opacity: 0.6 },
  ],
  card: [
    { ring: { R: 110, r: 9, d: 40 }, copies: 2, strokeWidth: 0.6, opacity: 0.55 },
    { ring: { R: 70, r: 6, d: 26 }, copies: 2, strokeWidth: 0.5, opacity: 0.45 },
  ],
  mark: [
    { ring: { R: 20, r: 3, d: 9 }, copies: 1, strokeWidth: 1.6, opacity: 1 },
  ],
} satisfies Record<string, Layer[]>;

export type GuillocheVariant = keyof typeof presets;

interface GuillocheProps {
  variant?: GuillocheVariant;
  animated?: boolean;
  className?: string;
}

/** Decorative banknote rosette. Colour comes from `currentColor`. */
export function Guilloche({ variant = "plate", animated = false, className }: GuillocheProps) {
  const id = useId();
  const layers: Layer[] = presets[variant];
  const extent = Math.max(...layers.map((layer) => ringRadius(layer.ring))) + 2;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`${-extent} ${-extent} ${extent * 2} ${extent * 2}`}
      className={cn("pointer-events-none", className)}
      fill="none"
      stroke="currentColor"
    >
      <defs>
        {layers.map((layer, index) => (
          <path
            key={index}
            id={`${id}-ring-${index}`}
            d={epitrochoidPath(layer.ring)}
            pathLength={1}
          />
        ))}
      </defs>
      {layers.flatMap((layer, index) =>
        Array.from({ length: layer.copies }, (_, copy) => (
          <use
            key={`${index}-${copy}`}
            href={`#${id}-ring-${index}`}
            className={animated ? "guilloche-ring" : undefined}
            strokeWidth={layer.strokeWidth}
            opacity={layer.opacity}
            transform={`rotate(${(copy * 360) / (layer.ring.R * layer.copies)})`}
            style={animated ? { animationDelay: `${index * 180 + copy * 90}ms` } : undefined}
          />
        )),
      )}
    </svg>
  );
}
