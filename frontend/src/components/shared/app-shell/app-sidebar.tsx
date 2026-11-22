"use client";

import Link from "next/link";
import { VAULT_ENABLED } from "@/config/features";
import { ShieldCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navItems, siteConfig } from "@/config/site";
import { Guilloche } from "../guilloche";
import { NavIcon } from "./nav-icon";
import { useIsActivePath } from "./use-active-path";
import { UserMenu } from "./user-menu";

export function AppSidebar() {
  const isActive = useIsActivePath();

  const renderItems = (items: readonly (typeof navItems)[number][]) =>
    items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={isActive(item.href)}
          tooltip={item.label}
          className="relative h-11 rounded-md px-3 font-medium group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:before:hidden data-[active=true]:bg-brand-gradient data-[active=true]:text-white data-[active=true]:before:absolute data-[active=true]:before:inset-y-2 data-[active=true]:before:left-0 data-[active=true]:before:w-[3px] data-[active=true]:before:bg-amber"
        >
          <Link href={item.href}>
            <NavIcon name={item.icon} />
            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip={siteConfig.name}>
              <Link href="/overview">
                <span className="bg-brand-gradient grid size-8 shrink-0 place-items-center rounded-md">
                  <Guilloche variant="mark" className="size-5 text-white" />
                </span>
                <span className="font-heading text-lg font-medium tracking-tight text-sidebar-primary group-data-[collapsible=icon]:hidden">
                  {siteConfig.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/55">Banking</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">{renderItems(navItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {VAULT_ENABLED && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/55">Crypto Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild size="lg" tooltip="Fernway Vault">
                    <Link href="/vault" className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-[#0B63F6]" />
                        <span>Fernway Vault</span>
                      </span>
                      <span className="rounded-full bg-[#0B63F6]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#0B63F6]">
                        Web3
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <UserMenu variant="sidebar" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
