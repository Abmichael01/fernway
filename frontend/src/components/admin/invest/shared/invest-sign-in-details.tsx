"use client";

import { TriangleAlert } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";

interface Props {
  name: string;
  email: string;
  password: string;
}

/** Sign-in details for an Invest customer, shown once so the admin can send them on. */
export function InvestSignInDetails({ name, email, password }: Props) {
  const signInUrl = typeof window === "undefined" ? "/invest/sign-in" : `${window.location.origin}/invest/sign-in`;
  const message = [
    `Hi ${name}, your Lindenway Invest account is ready.`,
    "",
    `Sign in: ${signInUrl}`,
    `Email: ${email}`,
    `Password: ${password}`,
  ].join("\n");
  const rows = [
    { label: "Sign-in link", value: signInUrl },
    { label: "Email", value: email },
    { label: "Password", value: password },
  ];

  return (
    <div className="flex flex-col gap-4">
      <dl className="divide-y rounded-md border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <dt className="text-xs font-medium text-muted-foreground">{row.label}</dt>
              <dd className="truncate font-heading text-[0.95rem] font-semibold tabular-nums select-all">{row.value}</dd>
            </div>
            <CopyButton value={row.value} label={row.label} />
          </div>
        ))}
      </dl>
      <CopyButton value={message} label="Copy all as a message" withText variant="default" className="h-11 w-full" />
      <p className="flex gap-2 rounded-md bg-pending/10 px-3 py-2.5 text-xs text-pending">
        <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden="true" />
        This is the only time the password is shown. Copy it now. If it&apos;s lost, set a new one in the customer&apos;s
        Profile tab.
      </p>
    </div>
  );
}
