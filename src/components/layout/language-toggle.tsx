"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();

  function getLocalePath(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    return segments.join("/");
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg bg-surface-hover p-0.5",
        className
      )}
    >
      <a
        href={getLocalePath("th")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          locale === "th"
            ? "bg-surface text-text shadow-sm"
            : "text-text-muted hover:text-text"
        )}
      >
        TH
      </a>
      <a
        href={getLocalePath("en")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          locale === "en"
            ? "bg-surface text-text shadow-sm"
            : "text-text-muted hover:text-text"
        )}
      >
        EN
      </a>
    </div>
  );
}
