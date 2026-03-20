"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem("nub-install-dismissed")) return;

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    setDeferredPrompt(null);
    localStorage.setItem("nub-install-dismissed", "true");
  }

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm animate-slide-up rounded-xl border border-border bg-surface p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <Download className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Install Nub App</p>
          <p className="mt-0.5 text-xs text-text-muted">
            Add to your home screen for quick access and offline calculator use.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleInstall}>
              Install
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              Not Now
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-text-muted hover:text-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
