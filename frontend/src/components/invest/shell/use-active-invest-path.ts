"use client";

import { usePathname } from "next/navigation";

export function useIsActiveInvestPath() {
  const pathname = usePathname();
  return (href: string) => (href === "/invest" ? pathname === "/invest" : pathname === href || pathname.startsWith(`${href}/`));
}
