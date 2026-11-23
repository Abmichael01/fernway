"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { SectionTitle } from "./section-title";

const items = [
  {
    title: "Instant Transfers",
    image: "/images/site/gen/wealth-crypto.png",
    text: "Send money directly to external bank accounts with transparent status updates from start to finish.",
    gradient: "from-[#065f46] to-[#10b981]",
  },
  {
    title: "High-Yield Savings",
    image: "/images/site/wealth-growth.jpg",
    text: "Let your money grow with a competitive variable rate and access your balance any time.",
    gradient: "from-[#064e3b] to-[#059669]",
  },
  {
    title: "Mobile App",
    image: "/images/site/wealth-phone.jpg",
    text: "Check balances, send money and control your cards from your phone, wherever you are.",
    gradient: "from-[#065f46] to-[#10b981]",
  },
  {
    title: "Spending Insights",
    image: "/images/site/wealth-analytics.jpg",
    text: "See where your money goes each month with cash-flow charts and spending by category.",
    gradient: "from-[#064e3b] to-[#059669]",
  },
  {
    title: "Physical Debit Cards",
    image: "/images/site/hero-online.jpg",
    text: "Manage your physical Visa debit card, monthly limits, and freeze controls in one tap.",
    gradient: "from-[#065f46] to-[#10b981]",
  },
];

export function GrowWealth() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    if (!api) return;
    const update = () => setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  return (
    <section id="wealth" className="scroll-mt-6 overflow-hidden bg-white py-[100px]">
      <div className="site-container">
        <SectionTitle title="Grow Your Money" subtitle="Don't just make a deposit, make your money work for you." />

        <Carousel setApi={setApi} opts={{ align: "start", loop: false }} className="mt-14">
          <CarouselContent className="-ml-[60px] overflow-visible">
            {items.map((item) => (
              <CarouselItem key={item.title} className="basis-[86%] pl-[60px] sm:basis-1/2 lg:basis-1/3">
                <article className="group pr-[30px]">
                  <div className="relative">
                    <div className="relative aspect-[341/350] w-full overflow-hidden">
                      <Image src={item.image} alt={`Lindenway Bank ${item.title}`} fill sizes="(min-width: 1024px) 341px, 80vw" className="object-cover saturate-[0.85] transition duration-700 group-hover:scale-105 group-hover:saturate-100" />
                    </div>
                    <Link
                      href="/sign-in"
                      className={`absolute right-[-30px] bottom-[30px] left-[30px] flex h-[60px] items-center justify-between overflow-hidden bg-gradient-to-r px-[30px] font-dm text-[22px] font-medium text-white ${item.gradient}`}
                    >
                      <span className="relative z-10">{item.title}</span>
                      <ArrowRight className="relative z-10 size-6" aria-hidden="true" />
                      <span aria-hidden="true" className="absolute top-0 right-24 h-full w-16 skew-x-[-30deg] bg-white/15" />
                    </Link>
                  </div>
                  <p className="bg-white p-[30px] font-body text-base leading-[26px] text-stone shadow-[0_15px_40px_rgb(0_0_0/0.07)]">
                    {item.text}
                  </p>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="mt-10 flex items-end justify-between border-b border-black/10 pb-0">
          <div className="flex gap-5">
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              aria-label="Previous"
              className="grid size-[50px] place-items-center border border-black/10 text-navy transition-colors hover:bg-flame hover:text-white"
            >
              <ArrowLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              aria-label="Next"
              className="grid size-[50px] place-items-center border border-black/10 text-navy transition-colors hover:bg-flame hover:text-white"
            >
              <ArrowRight className="size-5" />
            </button>
          </div>
          <p className="pb-2 font-dm text-3xl font-medium text-navy" aria-live="polite">
            {current}/<span className="text-lg text-stone-light"> {items.length}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
