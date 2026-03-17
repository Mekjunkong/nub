"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "nub-cookie-consent";

function getInitialVisibility(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(STORAGE_KEY);
}

export function CookieConsent() {
  const [visible, setVisible] = useState(getInitialVisibility);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface p-4 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-text-secondary">
          We use cookies to improve your experience and analyze usage. By accepting, you consent to analytics tracking per our PDPA privacy policy.
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={handleDecline} aria-label="Decline cookies">
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept} aria-label="Accept cookies">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
