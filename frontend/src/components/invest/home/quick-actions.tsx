import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { href: "/invest/deposit", label: "Deposit", icon: ArrowDownToLine },
  { href: "/invest/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { href: "/invest/portfolios", label: "Invest", icon: PieChart },
] as const;

export function QuickActions() {
  return (
    <>
      <ul className="grid grid-cols-3 gap-2 sm:hidden">
        {actions.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="flex flex-col items-center gap-2 text-xs font-medium active:opacity-70">
              <span className="bg-brand-gradient grid size-14 place-items-center rounded-full text-white shadow-[0_8px_20px_rgb(5_150_105/0.3)]">
                <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="hidden gap-2 sm:flex">
        {actions.map(({ href, label, icon: Icon }, index) => (
          <Button key={href} asChild variant={index === 2 ? "default" : "outline"}>
            <Link href={href}>
              <Icon data-icon="inline-start" />
              {label}
            </Link>
          </Button>
        ))}
      </div>
    </>
  );
}
