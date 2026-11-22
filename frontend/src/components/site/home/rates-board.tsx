"use client";

import { IfSupportEmail, SupportEmailLink } from "@/components/shared/support-email";
import Image from "next/image";
import { AlignRight, ArrowLeftRight, BadgeDollarSign, Landmark, PiggyBank, Zap } from "lucide-react";
import { savingsApy, transferPricing } from "@/config/marketing";
import { SectionTitle } from "./section-title";

const bankingIcons = [PiggyBank, ArrowLeftRight, Landmark, Zap, BadgeDollarSign];

function RateCard({ media, title, rows }: { media: React.ReactNode; title: string; rows: Array<[string, string]> }) {
  return (
    <div className="flex flex-col border border-white/15 text-white">
      <div className="flex flex-col items-center gap-4 px-4 pt-[30px] pb-6">
        {media}
        <p className="text-center font-dm text-lg font-medium">{title}</p>
      </div>
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between border-t border-white/10 bg-white/5 px-4 py-3.5 font-body text-base"
        >
          <span className="text-white/75">{label}</span>
          <span className="text-white/40">:</span>
          <span className="font-medium tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function RatesBoard() {
  return (
    <section id="rates" className="relative isolate scroll-mt-6 overflow-hidden bg-navy pt-[100px] pb-[70px]">
      <Image src="/images/site/rates-bg.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover opacity-30 grayscale" />
      <div className="absolute inset-0 -z-10 bg-navy/80" />
      <div className="site-container">
        <SectionTitle
          title="Rates & Fees"
          subtitle="Understanding what you earn and what you pay is key. Here are our account and transfer rates, in plain numbers."
          tone="light"
          className="max-w-5xl"
        />

        <div className="mt-10 flex flex-wrap items-end justify-end gap-4">
          <IfSupportEmail>
            <SupportEmailLink className="flex items-center gap-2 font-dm text-lg font-medium text-white hover:text-amber">
              <AlignRight className="size-5 text-amber" aria-hidden="true" />
              Click to Get Assistance
            </SupportEmailLink>
          </IfSupportEmail>
        </div>

        <div className="reveal mt-[36px]">
          <div className="grid grid-cols-2 gap-[30px] md:grid-cols-3 lg:grid-cols-5">
            <RateCard
              media={<RateIcon icon={bankingIcons[0]} />}
              title="Account Yield"
              rows={[
                ["APY¹", savingsApy],
                ["Paid", "Monthly"],
              ]}
            />
            {transferPricing.map((row, index) => (
              <RateCard
                key={row.method}
                media={<RateIcon icon={bankingIcons[index + 1]} />}
                title={row.method}
                rows={[
                  ["Fee", row.fee],
                  ["Speed", row.timing.replace(" business days", " days").replace("Same business day", "Same day")],
                ]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RateIcon({ icon: Icon }: { icon: typeof PiggyBank }) {
  return (
    <span className="grid size-[70px] place-items-center rounded-full border-4 border-white/10 bg-brand-gradient text-white">
      <Icon className="size-8" strokeWidth={1.5} aria-hidden="true" />
    </span>
  );
}
