import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Guilloche } from "./guilloche";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Guilloche variant="mark" className="size-7 text-brass" />
      <span className="font-figure text-[1.05rem] font-semibold tracking-tight">
        {siteConfig.name}
      </span>
    </span>
  );
}
