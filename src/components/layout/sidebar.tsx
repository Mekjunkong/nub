"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  BarChart3,
  MessageCircle,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Shield,
  PieChart,
  DollarSign,
  Receipt,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./language-toggle";
import { DarkModeToggle } from "./dark-mode-toggle";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: { href: string; label: string; icon: React.ReactNode }[];
}

export function Sidebar() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "calculators",
  ]);

  const navItems: NavItem[] = [
    {
      href: `/${locale}/dashboard`,
      label: t("nav.dashboard"),
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "#calculators",
      label: t("nav.calculators"),
      icon: <Calculator className="h-5 w-5" />,
      children: [
        {
          href: `/${locale}/calculator/retirement`,
          label: locale === "th" ? "เกษียณ" : "Retirement",
          icon: <Landmark className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/withdrawal`,
          label: locale === "th" ? "ถอนเงิน" : "Withdrawal",
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/stress-test`,
          label: locale === "th" ? "ทดสอบความเสี่ยง" : "Stress Test",
          icon: <Shield className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/mpt`,
          label: "MPT",
          icon: <PieChart className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/dca`,
          label: "DCA",
          icon: <DollarSign className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/tax`,
          label: locale === "th" ? "ภาษี" : "Tax",
          icon: <Receipt className="h-4 w-4" />,
        },
      ],
    },
    {
      href: `/${locale}/funds`,
      label: t("nav.funds"),
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      href: `/${locale}/chat`,
      label: t("nav.chat"),
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      href: `/${locale}/community`,
      label: t("nav.community"),
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: `/${locale}/profile`,
      label: t("nav.profile"),
      icon: <User className="h-5 w-5" />,
    },
  ];

  function toggleGroup(group: string) {
    setExpandedGroups((prev) =>
      prev.includes(group)
        ? prev.filter((g) => g !== group)
        : [...prev, group]
    );
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-surface transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <span className="text-xl font-bold gradient-text font-heading">
            Nub
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              {item.children ? (
                <>
                  <button
                    type="button"
                    onClick={() => toggleGroup("calculators")}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "text-text-secondary hover:bg-surface-hover hover:text-text"
                    )}
                  >
                    {item.icon}
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedGroups.includes("calculators") &&
                              "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed &&
                    expandedGroups.includes("calculators") && (
                      <ul className="ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <a
                              href={child.href}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                                isActive(child.href)
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-text-secondary hover:bg-surface-hover hover:text-text"
                              )}
                            >
                              {child.icon}
                              <span>{child.label}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                </>
              ) : (
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text"
                  )}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom actions */}
      {!collapsed && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <DarkModeToggle />
          </div>
        </div>
      )}
    </aside>
  );
}
