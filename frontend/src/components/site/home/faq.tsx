import { IfSupportEmail, SupportEmailAddress, SupportEmailLink } from "@/components/shared/support-email";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionTitle } from "./section-title";

const questions = [
  {
    question: "Can I open an account today?",
    answer:
      "Fernway is invitation only, with accounts opened directly by our team. Contact us to request an invitation.",
  },
  {
    question: "How long do transfers take?",
    answer:
      "Moves between your Fernway accounts are instant. Standard ACH transfers arrive within 2 business days, same-day ACH arrives the same business day, and wires usually arrive within a few hours.",
  },
  {
    question: "What does it cost to send money?",
    answer:
      "Standard ACH transfers and moves between your own accounts are free. Same-day ACH costs $2.00 and a wire costs $15.00. You always see the fee before you confirm.",
  },
  {
    question: "How do I set up direct deposit?",
    answer: "Sign in, choose Add money on your Overview, and give your employer the routing and account numbers shown there.",
  },
  {
    question: "What happens if I lose my card?",
    answer: "Sign in and freeze the card from the Cards screen. No payments or withdrawals can go through until you unfreeze it.",
  },
  {
    question: "Is crypto insured?",
    answer:
      "No. Crypto is not a bank deposit, is not FDIC insured, and its value can go down as well as up. Only invest what you can afford to lose.",
  },
];

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
          {questions.map((item, index) => (
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
