"use client";

import Link from "next/link";
import { navItems } from "@/config/site";
import { cn } from "@/lib/utils";
import { NavIcon } from "./nav-icon";
import { useIsActivePath } from "./use-active-path";

export function MobileNav() {
  const isActive = useIsActivePath();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 pt-2.5 pb-2 text-[0.68rem] font-medium outline-none focus-visible:bg-muted active:opacity-70",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {active && <span aria-hidden="true" className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
                <NavIcon name={item.icon} className="size-[22px]" />
                {item.shortLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
