"use client";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Calculator, BarChart3, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();

  const tabs = [
    { href: `/${locale}/dashboard`, label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: `/${locale}/calculator`, label: t("nav.calculators"), icon: Calculator },
    { href: `/${locale}/funds`, label: t("nav.funds"), icon: BarChart3 },
    { href: `/${locale}/blog`, label: t("nav.blog"), icon: BookOpen },
    { href: `/${locale}/profile`, label: t("nav.profile"), icon: User },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-surface/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all duration-200",
                active
                  ? "text-primary"
                  : "text-text-muted hover:text-text"
              )}
            >
              {/* Active indicator pill */}
              {active && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-gradient-to-r from-primary to-secondary" />
              )}

              {/* Icon container */}
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                  active ? "bg-primary-light" : ""
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] transition-all duration-200",
                    active && "scale-110"
                  )}
                />
              </span>

              <span
                className={cn(
                  "text-[9px] font-semibold tracking-wide transition-all duration-200",
                  active ? "text-primary" : "text-text-muted"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
