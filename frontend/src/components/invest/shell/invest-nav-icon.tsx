import { ArrowDownToLine, ArrowUpFromLine, LayoutDashboard, type LucideIcon, PieChart, ReceiptText } from "lucide-react";
import type { InvestNavIcon as IconName } from "@/config/invest";

const icons: Record<IconName, LucideIcon> = {
  LayoutDashboard,
  PieChart,
  ArrowDownToLine,
  ArrowUpFromLine,
  ReceiptText,
};

export function InvestNavIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = icons[name];
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}
