"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, Eye, EyeOff, LogOut, Monitor, Moon, Sun } from "lucide-react";
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
import { useSignOut } from "@/hooks/auth/useSignOut";
import { useCurrentUser } from "@/hooks/users/useCurrentUser";
import { usePreferences } from "@/stores/user/preferences";
import type { User } from "@/types/banking";

export function UserMenu({ variant }: { variant: "sidebar" | "compact" }) {
  const { data: user } = useCurrentUser();

  if (!user) {
    return variant === "sidebar" ? <SidebarMenuSkeleton showIcon /> : <Skeleton className="size-9 rounded-full" />;
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  const avatar = (
    <Avatar className="size-8 shrink-0 rounded-lg">
      <AvatarFallback className="rounded-lg bg-brass text-xs font-semibold text-white">{initials}</AvatarFallback>
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
        <UserMenuContent user={user} align="end" />
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
              <span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium text-sidebar-primary">
                  {user.firstName} {user.lastName}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
              </span>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <UserMenuContent user={user} align="start" side="top" />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function UserMenuContent({
  user,
  align,
  side,
}: {
  user: User;
  align: "start" | "end";
  side?: "top" | "bottom";
}) {
  const hideBalances = usePreferences((state) => state.hideBalances);
  const toggleHideBalances = usePreferences((state) => state.toggleHideBalances);
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenuContent align={align} side={side} className="w-60">
      <DropdownMenuLabel className="font-normal">
        <span className="block font-medium">
          {user.firstName} {user.lastName}
        </span>
        <span className="block text-xs text-muted-foreground">{user.phone}</span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={toggleHideBalances}>
        {hideBalances ? <Eye /> : <EyeOff />}
        {hideBalances ? "Show balances" : "Hide balances"}
      </DropdownMenuItem>
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
      <SignOutItem />
    </DropdownMenuContent>
  );
}

function SignOutItem() {
  const router = useRouter();
  const signOut = useSignOut();

  return (
    <DropdownMenuItem
      disabled={signOut.isPending}
      onSelect={() =>
        signOut.mutate(undefined, {
          onSettled: () => router.replace("/sign-in"),
        })
      }
    >
      <LogOut />
      {signOut.isPending ? "Signing out…" : "Sign out"}
    </DropdownMenuItem>
  );
}
