"use client";

import type { ReactNode } from "react";
import { CopyButton } from "@/components/shared/copy-button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/shared/responsive-modal";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { siteConfig } from "@/config/site";
import { useCurrentUser } from "@/hooks/users/useCurrentUser";
import type { Account } from "@/types/banking";

export function AddMoneyDialog({ account, children }: { account: Account; children: ReactNode }) {
  const { data: user } = useCurrentUser();

  const details = [
    { label: "Routing number", value: account.routingNumber, copy: true },
    { label: "Account number", value: account.accountNumber, copy: true },
    { label: "Account type", value: "Checking", copy: false },
    { label: "Name on account", value: user ? `${user.firstName} ${user.lastName}` : "…", copy: false },
  ];

  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>
      <ResponsiveModalContent className="max-md:px-4 max-md:pb-6">
        <ResponsiveModalHeader className="max-md:px-0">
          <ResponsiveModalTitle className="font-heading">Add money to {account.name}</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Your {siteConfig.name} account details, for direct deposit and transfers from another bank.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <ItemGroup className="rounded-lg border">
          {details.map((detail) => (
            <Item key={detail.label} size="sm">
              <ItemContent>
                <ItemDescription>{detail.label}</ItemDescription>
                <ItemTitle className="font-heading text-base tabular-nums">{detail.value}</ItemTitle>
              </ItemContent>
              {detail.copy && (
                <ItemActions>
                  <CopyButton value={detail.value} label={detail.label} />
                </ItemActions>
              )}
            </Item>
          ))}
        </ItemGroup>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
