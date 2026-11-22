import Link from "next/link";
import { Sprout } from "lucide-react";
import { EmptyState } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";

export function HomeEmpty({ hasCash }: { hasCash: boolean }) {
  return (
    <EmptyState
      className="rounded-lg border border-dashed"
      icon={<Sprout />}
      title="You don't hold anything yet"
      description={
        hasCash
          ? "Your investing cash is ready. Pick a managed portfolio or buy a coin directly."
          : "Deposit crypto to fund your investing cash, then pick a portfolio or buy a coin."
      }
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/invest/deposit">Deposit</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/invest/portfolios">See portfolios</Link>
          </Button>
        </div>
      }
    />
  );
}
