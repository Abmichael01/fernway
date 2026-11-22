"use client";

import { usePathname } from "next/navigation";
import { investNavItems } from "@/config/invest";
import { cn } from "@/lib/utils";

export function InvestCurrentTitle({ className }: { className?: string }) {
  const pathname = usePathname();
  const current = [...investNavItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return <p className={cn("text-sm font-medium text-muted-foreground", className)}>{current?.label}</p>;
}
