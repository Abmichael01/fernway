"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "@/api/auth";

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    // Drop every cached record so the next person on this device sees nothing.
    onSettled: () => queryClient.clear(),
  });
}
