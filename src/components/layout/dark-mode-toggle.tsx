"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): boolean {
  const stored = localStorage.getItem("nub-dark-mode");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return stored ? stored === "true" : prefersDark;
}

function getServerSnapshot(): boolean {
  return false;
}

export function DarkModeToggle({ className }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const newValue = !getSnapshot();
    localStorage.setItem("nub-dark-mode", String(newValue));
    document.documentElement.classList.toggle("dark", newValue);
    emitChange();
  }, []);

  // Sync the DOM class on first client render
  if (typeof window !== "undefined") {
    document.documentElement.classList.toggle("dark", isDark);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
