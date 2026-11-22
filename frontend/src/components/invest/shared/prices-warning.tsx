import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function PricesWarning({ className }: { className?: string }) {
  return (
    <div
      role="alert"
      className={cn("flex items-start gap-3 rounded-lg border border-amber/40 bg-amber-soft/60 p-4 text-sm text-ink dark:bg-amber/10 dark:text-foreground", className)}
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-ember dark:text-amber" aria-hidden="true" />
      <p>
        <span className="font-medium">Prices are delayed.</span> Values shown are approximate, and buying and selling is paused until live prices are back.
      </p>
    </div>
  );
}
