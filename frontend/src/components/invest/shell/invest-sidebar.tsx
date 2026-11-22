"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { investConfig, investNavItems } from "@/config/invest";
import { InvestBrand } from "./invest-brand";
import { InvestNavIcon } from "./invest-nav-icon";
import { InvestUserMenu } from "./invest-user-menu";
import { useIsActiveInvestPath } from "./use-active-invest-path";

export function InvestSidebar() {
  const isActive = useIsActiveInvestPath();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip={investConfig.name} className="text-sidebar-primary">
              <Link href={investConfig.homePath}>
                <InvestBrand />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {investNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    className="relative h-11 rounded-md px-3 font-medium group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:before:hidden data-[active=true]:bg-brand-gradient data-[active=true]:text-white data-[active=true]:before:absolute data-[active=true]:before:inset-y-2 data-[active=true]:before:left-0 data-[active=true]:before:w-[3px] data-[active=true]:before:bg-amber"
                  >
                    <Link href={item.href}>
                      <InvestNavIcon name={item.icon} />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-4">
        <InvestUserMenu variant="sidebar" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
