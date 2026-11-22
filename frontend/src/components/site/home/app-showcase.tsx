import Link from "next/link";
import { ArrowLeftRight, Bell, CreditCard, Plus, Send, ShieldCheck, Snowflake } from "lucide-react";
import { Guilloche } from "@/components/shared/guilloche";
import { formatMoney } from "@/lib/money";
import { SectionTitle } from "./section-title";

const features = [
  { icon: ArrowLeftRight, title: "Move money in seconds", text: "Send directly to any bank account with clear status updates." },
  { icon: Snowflake, title: "Card controls that work", text: "Freeze a card or switch off online payments the moment something feels off." },
  { icon: CreditCard, title: "Physical debit card", text: "Reveal your card details, PIN, and monthly spend limit whenever you need them." },
  { icon: ShieldCheck, title: "Every fee up front", text: "See the exact transfer details and balance impact before you confirm." },
];

const activity = [
  { name: "Paycheck", detail: "Direct deposit", amount: 385_000 },
  { name: "Coffee", detail: "Debit card", amount: -989 },
  { name: "Dinner split", detail: "Transfer", amount: -4_800 },
];

/** A phone mockup of the real Fernway app, built from the app's own visual language. */
export function AppShowcase() {
  return (
    <section className="overflow-hidden bg-beige py-[100px]">
      <div className="site-container grid items-center gap-16 lg:grid-cols-[1fr_minmax(0,460px)]">
        <div>
          <SectionTitle
            title="All Your Money, In One App"
            subtitle="Everything you can do at Fernway, from managing cards to sending transfers, sits one tap from your balance."
            align="left"
          />
          <ul className="reveal mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span className="bg-brand-gradient grid size-12 shrink-0 place-items-center text-white">
                  <feature.icon className="size-5" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-dm text-lg font-medium text-navy">{feature.title}</span>
                  <span className="mt-1 block font-body text-[15px] leading-6 text-stone">{feature.text}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/sign-in"
            className="bg-brand-gradient reveal mt-12 inline-flex h-[60px] items-center px-[30px] font-dm text-lg font-medium text-white transition-opacity hover:opacity-90"
          >
            Sign In
          </Link>
        </div>

        <div aria-hidden="true" className="reveal relative mx-auto w-full max-w-[340px]">
          <div className="absolute -inset-10 -z-10 rounded-full bg-amber/25 blur-3xl" />
          <div className="rounded-[44px] border-[10px] border-navy bg-navy shadow-[0_40px_80px_rgb(26_28_35/0.35)]">
            <div className="overflow-hidden rounded-[34px] bg-[#f8f5f1]">
              <div className="flex items-center justify-between px-5 pt-4 pb-2 font-body text-[11px] font-semibold text-navy">
                <span>9:41</span>
                <span className="h-5 w-20 rounded-full bg-navy" />
                <Bell className="size-3.5" />
              </div>
              <div className="px-4 pb-5">
                <p className="font-body text-xs text-stone">Good morning</p>
                <p className="font-dm text-lg font-medium text-navy">Your money</p>

                <div className="relative isolate mt-3 overflow-hidden rounded-2xl bg-ember p-4 text-white">
                  <Guilloche variant="card" className="absolute -right-16 -bottom-20 -z-10 size-56 text-amber opacity-70" />
                  <p className="font-body text-[11px] text-white/75">Cash balance</p>
                  <p className="font-dm text-[28px] leading-tight font-medium">{formatMoney(3_282_237, "USD")}</p>
                  <div className="mt-3 flex gap-4 font-body text-[10px] text-white/80">
                    <span>Checking {formatMoney(864_237, "USD", { whole: true })}</span>
                    <span>Savings {formatMoney(2_418_000, "USD", { whole: true })}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center font-body text-[10px] text-navy">
                  {[
                    { icon: Send, label: "Send" },
                    { icon: Plus, label: "Add" },
                    { icon: CreditCard, label: "Cards" },
                  ].map((action) => (
                    <span key={action.label} className="flex flex-col items-center gap-1.5">
                      <span className="grid size-10 place-items-center rounded-xl bg-white text-flame shadow-sm">
                        <action.icon className="size-4" />
                      </span>
                      {action.label}
                    </span>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm">
                  <p className="font-dm text-xs font-medium text-navy">Recent transactions</p>
                  <ul className="mt-2 flex flex-col divide-y divide-black/5">
                    {activity.map((row) => (
                      <li key={row.name} className="flex items-center justify-between py-2 font-body">
                        <span>
                          <span className="block text-[11px] font-semibold text-navy">{row.name}</span>
                          <span className="block text-[10px] text-stone">{row.detail}</span>
                        </span>
                        <span className={`text-[11px] font-semibold ${row.amount > 0 ? "text-credit" : "text-navy"}`}>
                          {formatMoney(row.amount, "USD", { signed: true })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
