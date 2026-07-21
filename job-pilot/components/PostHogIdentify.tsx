"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

interface PostHogIdentifyProps {
  userId: string;
  name?: string;
  providers?: string[];
}

export function PostHogIdentify({ userId, name, providers }: PostHogIdentifyProps) {
  useEffect(() => {
    posthog.identify(userId, { name, providers });
    posthog.capture("dashboard_viewed", {
      provider_count: providers?.length || 0,
    });
  }, [userId, name, providers]);

  return null;
}
