"use client";

import { usePathname } from "next/navigation";
import { navItems } from "@/config/site";
import { cn } from "@/lib/utils";

export function CurrentPageTitle({ className }: { className?: string }) {
  const pathname = usePathname();
  const current = [...navItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname.startsWith(item.href));

  return <p className={cn("text-sm font-medium text-muted-foreground", className)}>{current?.label}</p>;
}
