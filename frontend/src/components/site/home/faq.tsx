import { IfSupportEmail, SupportEmailAddress, SupportEmailLink } from "@/components/shared/support-email";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqItems } from "@/config/marketing";
import { SectionTitle } from "./section-title";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-6 bg-white py-[100px]">
      <div className="site-container grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionTitle
            title="Questions, Answered"
            subtitle="The things people ask us most before opening an account."
            align="left"
          />
          <IfSupportEmail>
            <p className="reveal mt-8 font-body text-base text-stone">
              Still unsure? Email{" "}
              <SupportEmailLink className="font-medium text-flame underline underline-offset-4">
                <SupportEmailAddress />
              </SupportEmailLink>{" "}
              and we&apos;ll get back to you.
            </p>
          </IfSupportEmail>
        </div>
        <Accordion type="single" collapsible defaultValue="item-0" className="reveal border-t border-black/10">
          {faqItems.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`} className="border-black/10">
              <AccordionTrigger className="py-6 font-dm text-xl font-medium text-navy hover:text-flame hover:no-underline data-[state=open]:text-flame">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 font-body text-base leading-7 text-stone">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
