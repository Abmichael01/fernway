import type { Metadata } from "next";
import { AppShowcase } from "@/components/site/home/app-showcase";
import { BankingNeeds } from "@/components/site/home/banking-needs";
import { BetterTomorrow } from "@/components/site/home/better-tomorrow";
import { CardPromo } from "@/components/site/home/card-promo";
import { Faq } from "@/components/site/home/faq";
import { GrowWealth } from "@/components/site/home/grow-wealth";
import { HeroSlider } from "@/components/site/home/hero-slider";
import { Highlights } from "@/components/site/home/highlights";
import { RatesBoard } from "@/components/site/home/rates-board";
import { ServiceRequests } from "@/components/site/home/service-requests";
import { SloganBanner } from "@/components/site/home/slogan-banner";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} · Online Banking, Cards & Transfers` },
  description: "Online banking with a physical debit card and simple bank transfers in one account.",
};

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <Highlights />
      <BetterTomorrow />
      <BankingNeeds />
      <GrowWealth />
      <ServiceRequests />
      <CardPromo />
      <AppShowcase />
      <RatesBoard />
      <Faq />
      <SloganBanner />
    </>
  );
}
