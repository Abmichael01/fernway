import { ArrowLeftRight, CreditCard, LayoutDashboard, type LucideIcon, ReceiptText } from "lucide-react";
import type { NavIcon as NavIconName } from "@/config/site";

const icons: Record<NavIconName, LucideIcon> = {
  overview: LayoutDashboard,
  transactions: ReceiptText,
  transfers: ArrowLeftRight,
  cards: CreditCard,
};

export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const Icon = icons[name];
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}
