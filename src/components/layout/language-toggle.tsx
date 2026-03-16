"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    // Replace the locale segment in the pathname
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg bg-surface-hover p-0.5",
        className
      )}
    >
      <button
        type="button"
        onClick={() => switchLocale("th")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          locale === "th"
            ? "bg-surface text-text shadow-sm"
            : "text-text-muted hover:text-text"
        )}
      >
        TH
      </button>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          locale === "en"
            ? "bg-surface text-text shadow-sm"
            : "text-text-muted hover:text-text"
        )}
      >
        EN
      </button>
    </div>
  );
}
