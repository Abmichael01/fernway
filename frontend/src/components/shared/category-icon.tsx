import {
  ArrowLeftRight,
  Bitcoin,
  BriefcaseBusiness,
  CarFront,
  Clapperboard,
  Coffee,
  House,
  type LucideIcon,
  Percent,
  PiggyBank,
  ReceiptText,
  ShoppingBag,
  ShoppingBasket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionCategory } from "@/types/banking";

const icons: Record<TransactionCategory, LucideIcon> = {
  income: BriefcaseBusiness,
  transfer: ArrowLeftRight,
  housing: House,
  groceries: ShoppingBasket,
  dining: Coffee,
  transport: CarFront,
  bills: ReceiptText,
  shopping: ShoppingBag,
  entertainment: Clapperboard,
  savings: PiggyBank,
  crypto: Bitcoin,
  fees: Percent,
};

export function CategoryIcon({ category, className }: { category: TransactionCategory; className?: string }) {
  const Icon = icons[category];
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary", className)}>
      <Icon className="size-[1.05rem]" strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}
