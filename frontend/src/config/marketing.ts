/** Public website copy and navigation. Rates and fees mirror the values the API enforces. */

export const savingsApy = "4.10%";


export const serviceLinks = [
  { href: "/#services", title: "Online Account", description: "Direct deposit, bill pay and simple bank transfers." },
  { href: "/#services", title: "Account Balance", description: `Earn ${savingsApy} APY¹ on your balance.` },
  { href: "/#card", title: "Debit Cards", description: "Physical debit cards with instant controls." },
] as const;

export const aboutLinks = [
  { href: "/#rates", title: "Rates & Fees", description: "What you earn and what moving money costs." },
  { href: "/#support", title: "Service Requests", description: "Card, account and transfer help in one place." },
] as const;

export const transferPricing = [
  { method: "Bank Transfer", fee: "Free", timing: "Manual approval" },
  { method: "Standard ACH", fee: "Free", timing: "1–3 business days" },
  { method: "Same-Day ACH", fee: "$2.00", timing: "Same business day" },
  { method: "Wire Transfer", fee: "$15.00", timing: "Within a few hours" },
] as const;

export const footerColumns = [
  {
    title: "Accounts",
    links: [
      { href: "/#services", label: "Online Account" },
      { href: "/#services", label: "Account Balance" },
      { href: "/#card", label: "Debit Cards" },
    ],
  },
  {
    title: "Rates & Fees",
    links: [
      { href: "/#rates", label: "Account Rates" },
      { href: "/#rates", label: "Transfer Fees" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/#support", label: "Service Requests" },
      { href: "/#faq", label: "FAQ" },
      { href: "/#contact", label: "Get In Touch" },
      { href: "/sign-in", label: "Login" },
    ],
  },
  {
    title: "Get Started",
    links: [
      { href: "/sign-in", label: "Sign In" },
      { href: "/#wealth", label: "Grow Your Money" },
      { href: "/#card", label: "Debit Cards" },
    ],
  },
] as const;
