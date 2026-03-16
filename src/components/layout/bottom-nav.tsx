"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  BarChart3,
  BookOpen,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();

  const tabs = [
    {
      href: `/${locale}/dashboard`,
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
    },
    {
      href: `/${locale}/calculator`,
      label: t("nav.calculators"),
      icon: Calculator,
    },
    {
      href: `/${locale}/funds`,
      label: t("nav.funds"),
      icon: BarChart3,
    },
    {
      href: `/${locale}/blog`,
      label: t("nav.blog"),
      icon: BookOpen,
    },
    {
      href: `/${locale}/profile`,
      label: t("nav.profile"),
      icon: User,
    },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          return (
            <a
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 transition-colors",
                active ? "text-primary" : "text-text-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
