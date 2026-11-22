import { ArrowLeftRight, Bitcoin, Zap, PiggyBank } from "lucide-react";
import { savingsApy } from "@/config/marketing";

/** Product facts, each one backed by a rate or rule the app actually enforces. */
const facts = [
  { icon: PiggyBank, value: savingsApy, unit: "APY¹", label: "on High-Yield Savings" },
  { icon: ArrowLeftRight, value: "$0", unit: "", label: "for standard ACH transfers" },
  { icon: Bitcoin, value: "$10", unit: "", label: "minimum crypto trade" },
  { icon: Zap, value: "Instant", unit: "", label: "moves between your accounts" },
];

export function Highlights() {
  return (
    <section aria-label="Fernway in numbers" className="relative z-10 flow-root bg-beige">
      <div className="site-container">
        <ul className="reveal -mt-10 grid bg-white shadow-[0_25px_60px_rgb(26_28_35/0.08)] sm:grid-cols-2 lg:-mt-[60px] lg:grid-cols-4">
          {facts.map((fact) => (
            <li key={fact.label} className="flex items-center gap-5 border-black/5 px-8 py-9 not-last:border-b sm:not-last:border-r lg:not-last:border-b-0">
              <span className="bg-brand-gradient grid size-14 shrink-0 place-items-center text-white">
                <fact.icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-dm text-[32px] leading-none font-medium text-navy">
                  {fact.value}
                  {fact.unit && <span className="ml-1 text-base text-flame">{fact.unit}</span>}
                </span>
                <span className="mt-2 block font-body text-[15px] text-stone">{fact.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
