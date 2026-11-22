import { Guilloche } from "@/components/shared/guilloche";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Logo lockup for the public website: rosette mark plus wordmark. */
export function SiteLogo({ className, tone = "light" }: { className?: string; tone?: "light" | "brand" }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Guilloche variant="mark" className={cn("size-10", tone === "light" ? "text-white" : "text-amber")} />
      <span className={cn("font-dm text-2xl font-medium tracking-tight", tone === "light" ? "text-white" : "text-amber")}>
        {siteConfig.name}
      </span>
    </span>
  );
}
