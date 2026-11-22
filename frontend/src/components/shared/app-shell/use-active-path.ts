"use client";

import { usePathname } from "next/navigation";

export function useIsActivePath() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}
