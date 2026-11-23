"use client";

import { IfSupportEmail, SupportEmailLink } from "@/components/shared/support-email";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CirclePlay } from "lucide-react";
import { savingsApy } from "@/config/marketing";
import { cn } from "@/lib/utils";
import { TrianglePattern } from "@/components/shared/triangle-pattern";

const slides = [
  {
    image: "/images/site/gen/hero-card.png",
    alt: "Lindenway Bank physical Visa debit card and online banking account",
    title: "A Smarter Way to Spend, Save and Invest",
    text: "Checking, high-yield savings and transfers in one Lindenway Bank account, built around the way you manage money.",
  },
  {
    image: "/images/site/hero-handover.jpg",
    alt: "Lindenway Bank high-yield savings account earning competitive annual yield",
    title: `Earn ${savingsApy} APY¹ on Every Dollar You Save`,
    text: "Grow your savings with a competitive rate and move money to checking instantly whenever you need it.",
  },
  {
    image: "/images/site/hero-online.jpg",
    alt: "Lindenway Bank fast same-day ACH transfers and mobile card controls",
    title: "Money That Moves as Fast as You Do",
    text: "Send money the same business day, freeze your card in one tap and see every payment as it happens.",
  },
];

const AUTOPLAY_MS = 7000;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((step: number) => setIndex((current) => (current + step + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, go]);

  return (
    <section aria-roledescription="carousel" aria-label="Highlights" className="site-container-wide">
      <div
        className="relative isolate h-[620px] overflow-hidden bg-navy lg:h-[731px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.image}
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} of ${slides.length}`}
            aria-hidden={slideIndex !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none",
              slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={slideIndex === 0}
              sizes="(min-width: 1440px) 1340px, 100vw"
              className={cn("-z-20 object-cover object-left", slideIndex === index && "animate-ken-burns")}
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/35 via-navy/55 to-navy/75" />
            <TrianglePattern className="absolute inset-y-0 right-0 -z-10 hidden h-full w-[58%] lg:block" />

            <div className="flex h-full items-center px-6 pb-48 sm:px-12 lg:pb-16 lg:pl-[585px]">
              <div
                className={cn(
                  "max-w-[670px]",
                  slideIndex === index && "animate-in fade-in slide-in-from-bottom-8 duration-700 motion-reduce:animate-none",
                )}
              >
                {slideIndex === 0 ? (
                  <h1 className="font-dm text-4xl leading-tight font-medium text-white sm:text-5xl lg:text-[60px] lg:leading-[72px]">
                    {slide.title}
                  </h1>
                ) : (
                  <h2 className="font-dm text-4xl leading-tight font-medium text-white sm:text-5xl lg:text-[60px] lg:leading-[72px]">
                    {slide.title}
                  </h2>
                )}
                <p className="mt-6 max-w-xl font-body text-lg text-white/80">{slide.text}</p>
                <Link
                  href="/sign-in"
                  tabIndex={slideIndex === index ? 0 : -1}
                  className="mt-10 inline-flex h-[60px] items-center bg-white px-[30px] font-dm text-lg font-medium text-navy transition-colors hover:bg-flame hover:text-white"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute right-8 bottom-[100px] hidden items-center gap-5 lg:flex" aria-hidden="true">
          <span className="font-dm text-lg font-medium text-white">
            {String(index + 1).padStart(2, "0")}
            <span className="text-white/50"> / {String(slides.length).padStart(2, "0")}</span>
          </span>
          <span className="flex gap-2">
            {slides.map((slide, barIndex) => (
              <span key={slide.image} className="h-[3px] w-12 overflow-hidden bg-white/25">
                {barIndex === index && (
                  <span
                    key={index}
                    className="block h-full origin-left bg-white"
                    style={{
                      animation: `progress-fill ${AUTOPLAY_MS}ms linear both`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                )}
                {barIndex < index && <span className="block h-full bg-white" />}
              </span>
            ))}
          </span>
        </div>

        <div className="absolute bottom-[60px] left-5 flex items-end gap-3 sm:gap-5 lg:bottom-[84px]">
          <div className="flex flex-col gap-2.5">
            <Link
              href="/sign-in"
              className="flex h-[50px] w-[170px] items-center justify-between bg-ember px-4 font-dm text-base sm:w-[230px] sm:px-5 sm:text-lg font-medium text-white sm:w-[230px]"
            >
              Make a Transfer
              <CirclePlay className="size-5 text-white/70" aria-hidden="true" />
            </Link>
            <IfSupportEmail>
              <SupportEmailLink className="flex h-[50px] w-[170px] items-center justify-between bg-flame px-4 font-dm text-base sm:w-[230px] sm:px-5 sm:text-lg font-medium text-white sm:w-[230px]">
                Make an Enquiry
                <CirclePlay className="size-5 text-white/90" aria-hidden="true" />
              </SupportEmailLink>
            </IfSupportEmail>
          </div>
          <div className="flex gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="grid size-12 place-items-center bg-white/20 sm:size-[60px] text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-navy"
            >
              <ChevronLeft className="size-7" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="grid size-12 place-items-center bg-white/20 sm:size-[60px] text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-navy"
            >
              <ChevronRight className="size-7" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
