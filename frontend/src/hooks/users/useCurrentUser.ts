"use client";

import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/api/users";
import { queryKeys } from "@/hooks/query-keys";
import type { User } from "@/types/banking";

const noSubscription = () => () => {};

/**
 * The signed-in user. Until React has finished hydrating a component it reports no user,
 * exactly like the server render did. Without this, a component that hydrates late (inside a
 * streamed Suspense boundary) can find the user already loaded by another component (ThemeSync)
 * and render different HTML from the server, which React reports as a hydration error.
 */
export function useCurrentUser(): { data: User | undefined; isError: boolean } {
  const query = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
    staleTime: 5 * 60_000,
  });
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );

  return { data: hydrated ? query.data : undefined, isError: query.isError };
}
