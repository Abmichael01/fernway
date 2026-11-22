import { useId } from "react";
import { Snowflake } from "lucide-react";
import { Guilloche } from "@/components/shared/guilloche";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { CardBrand, PaymentCard } from "@/types/banking";

/**
 * Card stock. Each finish is a lit gradient (a highlight in one corner falling to a deep edge),
 * so the card reads as a physical object rather than a flat swatch.
 */
const finishes = {
  copper: "bg-[radial-gradient(130%_150%_at_0%_0%,#10b981_0%,#047857_42%,#022c22_100%)]",
  flame: "bg-[radial-gradient(130%_160%_at_100%_0%,#34d399_0%,#059669_38%,#064e3b_100%)]",
  graphite: "bg-[radial-gradient(130%_150%_at_0%_0%,#343846_0%,#1a1c23_48%,#0b0c10_100%)]",
} as const;

/** Fine paper grain, overlaid at low opacity. */
const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function EmvChip() {
  const gradientId = `chip-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg viewBox="0 0 50 38" className="h-[11cqw] w-auto drop-shadow-[0_1px_1px_rgb(0_0_0/0.35)]" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7e7b0" />
          <stop offset="0.4" stopColor="#d6ac4f" />
          <stop offset="0.7" stopColor="#b5852e" />
          <stop offset="1" stopColor="#ecd18a" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="49" height="37" rx="6" fill={`url(#${gradientId})`} stroke="#7a5a1c" strokeOpacity="0.55" />
      <g fill="none" stroke="#7a5a1c" strokeOpacity="0.6" strokeWidth="0.9">
        <rect x="17" y="10" width="16" height="18" rx="3" />
        <path d="M0.5 13H17M0.5 25H17M33 13H49.5M33 25H49.5M25 0.5V10M25 28V37.5" />
      </g>
    </svg>
  );
}

function ContactlessMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="size-[6.5cqw] opacity-85"
      aria-hidden="true"
    >
      <path d="M6 9.5a3.5 3.5 0 0 1 0 5" />
      <path d="M9.5 7a7 7 0 0 1 0 10" />
      <path d="M13 4.5a10.5 10.5 0 0 1 0 15" />
      <path d="M16.5 2a14 14 0 0 1 0 20" />
    </svg>
  );
}

function NetworkMark({ brand }: { brand: CardBrand }) {
  return (
    <span className="font-dm text-[4.6cqw] leading-none font-bold tracking-[0.18em]" aria-hidden="true">
      {brand === "mastercard" ? "MASTERCARD" : "VISA"}
    </span>
  );
}

interface CardFaceProps {
  card: PaymentCard;
  /** `accent` is the brighter flame finish used for showcase placements. */
  tone?: "brand" | "accent";
  className?: string;
}

export function CardFace({ card, tone = "brand", className }: CardFaceProps) {
  const finish = tone === "accent" ? finishes.flame : card.kind === "physical" ? finishes.copper : finishes.graphite;

  return (
    <div className={cn("@container w-full", className)}>
      <div
        role="img"
        aria-label={`${card.label}, debit card ending ${card.last4}${card.frozen ? ", frozen" : ""}`}
        className={cn(
          "relative isolate aspect-[1.586] w-full overflow-hidden rounded-[4.2cqw] text-white select-none",
          "shadow-[0_1px_2px_rgb(0_0_0/0.18),0_12px_24px_-10px_rgb(26_28_35/0.45),0_32px_60px_-28px_rgb(26_28_35/0.6)]",
          "transition-[filter] duration-300",
          finish,
          card.frozen && "grayscale-[0.8]",
        )}
      >
        {/* Material: grain, security rosette, a light sheen and a bevelled edge. */}
        <div className="absolute inset-0 -z-10 opacity-[0.22] mix-blend-overlay" style={{ backgroundImage: grain }} />
        <Guilloche
          variant="card"
          className="absolute -right-[16cqw] -bottom-[26cqw] -z-10 size-[72cqw] text-[#a7f3d0] opacity-40 mix-blend-screen"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_28%,rgb(255_255_255/0.13)_42%,rgb(255_255_255/0.04)_52%,transparent_62%)]" />
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.3),inset_0_0_0_1px_rgb(255_255_255/0.08),inset_0_-1px_0_rgb(0_0_0/0.25)]" />

        <div className="absolute inset-0 flex flex-col justify-between px-[6.5cqw] pt-[6cqw] pb-[5.5cqw] [text-shadow:0_1px_1px_rgb(0_0_0/0.25)]">
          <div className="flex items-start justify-between">
            <span className="flex items-center gap-[1.6cqw]">
              <Guilloche variant="mark" className="size-[5.4cqw] text-[#a7f3d0]" />
              <span className="font-figure text-[4.6cqw] leading-none font-semibold tracking-tight">{siteConfig.name}</span>
            </span>
            <span className="text-[2.5cqw] leading-none font-semibold tracking-[0.18em] uppercase opacity-80">
              {card.kind === "physical" ? "Debit" : "Virtual"}
            </span>
          </div>

          {/* Only a physical card carries a chip and contactless antenna. */}
          <div className="flex h-[11cqw] items-center gap-[3cqw]">
            {card.kind === "physical" && (
              <>
                <EmvChip />
                <ContactlessMark />
              </>
            )}
          </div>

          <p className="font-figure text-[5.6cqw] leading-none font-medium whitespace-nowrap tabular-nums tracking-[0.14em] [text-shadow:0_1px_0_rgb(0_0_0/0.45),0_-1px_0_rgb(255_255_255/0.18)]">
            <span className="opacity-80">••••&ensp;••••&ensp;••••</span>&ensp;{card.last4}
          </p>

          <div className="flex items-end justify-between gap-[3cqw]">
            <div className="flex min-w-0 items-end gap-[6cqw]">
              <div className="min-w-0">
                <p className="text-[2cqw] leading-none tracking-[0.12em] uppercase opacity-65">Card holder</p>
                <p className="mt-[1.2cqw] truncate text-[3.2cqw] leading-none font-medium tracking-[0.08em] uppercase">{card.holderName}</p>
              </div>
              <div className="shrink-0">
                <p className="text-[2cqw] leading-none tracking-[0.12em] uppercase opacity-65">Valid thru</p>
                <p className="mt-[1.2cqw] text-[3.2cqw] leading-none font-medium tabular-nums">{card.expiry}</p>
              </div>
            </div>
            <NetworkMark brand={card.brand} />
          </div>
        </div>

        {card.frozen && (
          <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,rgb(255_255_255/0.35),rgb(219_234_254/0.2))] backdrop-blur-[2px]">
            <span className="flex items-center gap-2 rounded-full bg-ink/85 px-4 py-1.5 text-sm font-medium text-white">
              <Snowflake className="size-4" aria-hidden="true" />
              Frozen
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
