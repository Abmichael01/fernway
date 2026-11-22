"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { INVEST_ENABLED } from "@/config/features";
import { cn } from "@/lib/utils";

const WORKSPACES = [
  {
    href: "/admin",
    label: "Banking",
    match: (path: string) => path === "/admin" || path.startsWith("/admin/customers"),
  },
  ...(INVEST_ENABLED
    ? [
        {
          href: "/admin/invest",
          label: "Invest",
          match: (path: string) => path.startsWith("/admin/invest"),
        },
      ]
    : []),
  {
    href: "/admin/settings",
    label: "Settings",
    match: (path: string) => path.startsWith("/admin/settings"),
  },
];

export function AdminWorkspaceNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={mobile ? "Admin workspaces" : "Admin"}
      className={cn(
        mobile
          ? "flex gap-1 overflow-x-auto border-t border-white/10 px-4 py-1.5 sm:hidden"
          : "ml-6 hidden items-center gap-1 rounded-lg bg-white/5 p-1 sm:flex",
      )}
    >
      {WORKSPACES.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              active ? "bg-white text-ink shadow-xs" : "text-white/75 hover:bg-white/10 hover:text-white",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
