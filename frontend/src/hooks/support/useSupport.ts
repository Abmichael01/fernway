"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authorizeSupportRealtime,
  createSupportThread,
  listSupportThreads,
  sendSupportReply,
  type SupportRealtimeConfig,
} from "@/api/support";

const noSubscription = () => () => {};

export const supportKeys = {
  all: ["support-threads"] as const,
};

export function useSupportThreads() {
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );

  return useQuery({
    queryKey: supportKeys.all,
    queryFn: listSupportThreads,
    enabled: hydrated,
    staleTime: 10_000,
    refetchInterval: (query) => (query.state.data?.realtime?.enabled ? false : 8_000),
  });
}

export function useCreateSupportThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupportThread,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supportKeys.all });
    },
  });
}

export function useSendSupportReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, body }: { threadId: string; body: string }) =>
      sendSupportReply(threadId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supportKeys.all });
    },
  });
}

export function useSupportRealtime(options: {
  config?: SupportRealtimeConfig;
  threadId?: string;
  channel?: string;
  onUpdate: () => void;
}) {
  const { config, threadId, channel, onUpdate } = options;

  useEffect(() => {
    if (!config?.enabled || !config.key || !config.cluster || !threadId || !channel) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void import("pusher-js").then(({ default: Pusher }) => {
      if (cancelled) return;

      const pusher = new Pusher(config.key, {
        cluster: config.cluster,
        forceTLS: true,
        channelAuthorization: {
          customHandler: async (params, callback) => {
            try {
              const auth = await authorizeSupportRealtime(threadId, params.socketId, params.channelName);
              callback(null, auth);
            } catch (error) {
              callback(error instanceof Error ? error : new Error("Realtime authorization failed."), null);
            }
          },
        },
      });

      const subscription = pusher.subscribe(channel);
      subscription.bind("support.updated", onUpdate);
      subscription.bind("support.created", onUpdate);
      subscription.bind("support.customer_message", onUpdate);

      cleanup = () => {
        subscription.unbind_all();
        pusher.unsubscribe(channel);
        pusher.disconnect();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [channel, config?.cluster, config?.enabled, config?.key, onUpdate, threadId]);
}
