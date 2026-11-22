import type { Metadata } from "next";
import { CardsView } from "@/components/dashboard/cards/cards-view";

export const metadata: Metadata = { title: "Cards" };

export default function CardsPage() {
  return <CardsView />;
}
