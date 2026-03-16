import posthog from "posthog-js";

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key) return;

  posthog.init(key, {
    api_host: host || "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    loaded: () => { initialized = true; },
  });
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.identify(userId, traits);
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

export function resetUser() {
  if (typeof window === "undefined") return;
  posthog.reset();
}

// Standard event names
export const Events = {
  CALCULATOR_STARTED: "calculator_started",
  CALCULATOR_COMPLETED: "calculator_completed",
  PLAN_SAVED: "plan_saved",
  PLAN_COMPARED: "plan_compared",
  SHARE_CLICKED: "share_clicked",
  PDF_EXPORTED: "pdf_exported",
  CHAT_MESSAGE_SENT: "chat_message_sent",
  FUND_VIEWED: "fund_viewed",
  FUND_COMPARED: "fund_compared",
  ONBOARDING_COMPLETED: "onboarding_completed",
  UPGRADE_CLICKED: "upgrade_clicked",
} as const;
