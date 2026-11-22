"use client";

import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvestMe } from "@/hooks/invest/useInvestMe";
import { useInvestSignOut } from "@/hooks/invest/useInvestSignOut";
import type { InvestUser } from "@/types/invest";

export function InvestUserMenu({ variant }: { variant: "sidebar" | "compact" }) {
  const { data: user } = useInvestMe();

  if (!user) return variant === "sidebar" ? <SidebarMenuSkeleton showIcon /> : <Skeleton className="size-9 rounded-full" />;

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
  const avatar = (
    <Avatar className="size-8 rounded-lg">
      <AvatarFallback className="bg-brand-gradient rounded-lg text-xs font-semibold text-white">{initials}</AvatarFallback>
    </Avatar>
  );

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Account menu for ${user.firstName} ${user.lastName}`}
        >
          {avatar}
        </DropdownMenuTrigger>
        <MenuContent user={user} align="end" />
      </DropdownMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              {avatar}
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium text-sidebar-primary">
                  {user.firstName} {user.lastName}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
              </span>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <MenuContent user={user} align="start" side="top" />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function MenuContent({ user, align, side }: { user: InvestUser; align: "start" | "end"; side?: "top" | "bottom" }) {
  const { theme, setTheme } = useTheme();
  const signOut = useInvestSignOut();

  return (
    <DropdownMenuContent align={align} side={side} className="w-60">
      <DropdownMenuLabel className="font-normal">
        <span className="block font-medium">
          {user.firstName} {user.lastName}
        </span>
        <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Theme</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
        <DropdownMenuRadioItem value="light">
          <Sun /> Light
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark">
          <Moon /> Dark
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="system">
          <Monitor /> System
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        disabled={signOut.isPending}
        onSelect={() => signOut.mutate()}
      >
        <LogOut />
        {signOut.isPending ? "Signing out…" : "Sign out"}
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
