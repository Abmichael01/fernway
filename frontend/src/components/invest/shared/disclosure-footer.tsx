import { INVEST_DISCLOSURE } from "@/config/invest";
import { cn } from "@/lib/utils";

export function DisclosureFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t pt-6 text-xs leading-relaxed text-muted-foreground", className)}>
      <p className="max-w-3xl">{INVEST_DISCLOSURE}</p>
    </footer>
  );
}
