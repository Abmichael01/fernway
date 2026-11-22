"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useSignOut } from "@/hooks/auth/useSignOut";
import { useCurrentUser } from "@/hooks/users/useCurrentUser";

export function AdminAccountMenu() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const signOut = useSignOut();

  if (!user) return <Skeleton className="size-9 rounded-full bg-white/15" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Admin account" className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-amber">
          <Avatar className="size-9">
            <AvatarFallback className="bg-brand-gradient text-xs font-semibold text-white">
              {user.firstName[0]}
              {user.lastName[0]}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">
            {user.firstName} {user.lastName}
          </span>
          <span className="truncate text-xs font-normal">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin">
            <Users />
            Customers
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={signOut.isPending}
          onSelect={() => signOut.mutate(undefined, { onSettled: () => router.replace("/sign-in") })}
        >
          <LogOut />
          {signOut.isPending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
