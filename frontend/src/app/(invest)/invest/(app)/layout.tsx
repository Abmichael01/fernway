import type { ReactNode } from "react";
import { InvestShell } from "@/components/invest/shell/invest-shell";

export default function InvestAppLayout({ children }: { children: ReactNode }) {
  return <InvestShell>{children}</InvestShell>;
}
