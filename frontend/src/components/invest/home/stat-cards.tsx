import type { ReactNode } from "react";
import { Banknote, Coins, TrendingUp, Wallet } from "lucide-react";
import { Money } from "@/components/shared/money";
import { cn } from "@/lib/utils";
import type { InvestOverview } from "@/types/invest";
import { GainLoss } from "../shared/gain-loss";

function Stat({ icon: Icon, label, value, footer, featured }: { icon: typeof Wallet; label: string; value: ReactNode; footer?: ReactNode; featured?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex w-[78%] shrink-0 snap-start flex-col gap-3 overflow-hidden border p-5 sm:w-auto",
        featured ? "bg-brand-gradient border-transparent text-white" : "bg-card",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", featured ? "bg-white/20" : "bg-brand-gradient text-white")}>
          <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className={cn("text-sm font-medium", featured ? "text-white/85" : "text-muted-foreground")}>{label}</span>
      </div>
      <div>
        <div className="font-heading text-[26px] leading-tight font-medium tabular-nums">{value}</div>
        {footer && <div className={cn("mt-1 text-xs", featured ? "text-white/80" : "text-muted-foreground")}>{footer}</div>}
      </div>
    </div>
  );
}

export function StatCards({ overview }: { overview: InvestOverview }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
      <Stat icon={Wallet} label="Total value" featured value={<Money amount={overview.total} currency="USD" />} footer="Cash plus everything you hold" />
      <Stat icon={Banknote} label="Investing cash" value={<Money amount={overview.cash} currency="USD" />} footer="Ready to invest or withdraw" />
      <Stat icon={Coins} label="Invested" value={<Money amount={overview.invested} currency="USD" />} footer={<>Cost <Money amount={overview.cost} currency="USD" /></>} />
      <Stat
        icon={TrendingUp}
        label="Gain or loss"
        value={<GainLoss value={overview.invested} cost={overview.cost} className="text-[inherit]" />}
        footer="Invested value minus cost"
      />
    </div>
  );
}
