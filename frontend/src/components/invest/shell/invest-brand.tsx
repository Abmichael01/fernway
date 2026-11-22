import { Guilloche } from "@/components/shared/guilloche";
import { investConfig } from "@/config/invest";
import { cn } from "@/lib/utils";

export function InvestBrand({ className, markOnly = false }: { className?: string; markOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="bg-brand-gradient grid size-8 shrink-0 place-items-center">
        <Guilloche variant="mark" className="size-5 text-white" />
      </span>
      {!markOnly && <span className="font-heading text-[1.05rem] font-medium tracking-tight">{investConfig.name}</span>}
    </span>
  );
}
