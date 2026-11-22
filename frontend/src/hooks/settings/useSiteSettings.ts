"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSiteSettings, updateSiteSettings } from "@/api/settings";
import { queryKeys } from "@/hooks/query-keys";

export function useSiteSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSiteSettings,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: (settings) => queryClient.setQueryData(queryKeys.settings, settings),
  });
}
