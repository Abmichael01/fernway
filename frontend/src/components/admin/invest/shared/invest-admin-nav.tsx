"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/invest", label: "Overview" },
  { href: "/admin/invest/customers", label: "Customers" },
  { href: "/admin/invest/portfolios", label: "Portfolios" },
  { href: "/admin/invest/withdrawals", label: "Withdrawals" },
  { href: "/admin/invest/deposits", label: "Deposits" },
  { href: "/admin/invest/settings", label: "Settings" },
];

export function InvestAdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Fernway Invest" className="-mx-4 flex gap-1 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
      {TABS.map((tab) => {
        const active = tab.href === "/admin/invest" ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
