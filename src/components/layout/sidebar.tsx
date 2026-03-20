"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Calculator,
  Activity,
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
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./language-toggle";
import { DarkModeToggle } from "./dark-mode-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: { href: string; label: string; icon: React.ReactNode }[];
}

// Index after which a divider is inserted (after Portfolio Health, before Funds)
const DIVIDER_AFTER_INDEX = 2;

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
          label: t("nav.calc.retirement"),
          icon: <Landmark className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/withdrawal`,
          label: t("nav.calc.withdrawal"),
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/stress-test`,
          label: t("nav.calc.stressTest"),
          icon: <Shield className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/mpt`,
          label: t("nav.calc.mpt"),
          icon: <PieChart className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/dca`,
          label: t("nav.calc.dca"),
          icon: <DollarSign className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/tax`,
          label: t("nav.calc.tax"),
          icon: <Receipt className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/cashflow`,
          label: t("nav.calc.cashflow"),
          icon: <Wallet className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/roic`,
          label: t("nav.calc.roic"),
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/gpf-optimizer`,
          label: t("nav.calc.gpfOptimizer"),
          icon: <PieChart className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/tipp`,
          label: t("nav.calc.tipp"),
          icon: <Shield className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/bumnan95`,
          label: t("nav.calc.bumnan95"),
          icon: <Calculator className="h-4 w-4" />,
        },
        {
          href: `/${locale}/calculator/compare`,
          label: t("nav.calc.compare"),
          icon: <BarChart3 className="h-4 w-4" />,
        },
      ],
    },
    {
      href: `/${locale}/portfolio-health`,
      label: t("nav.portfolioHealth"),
      icon: <Activity className="h-5 w-5" />,
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

  function isGroupActive(item: NavItem) {
    if (!item.children) return false;
    return item.children.some((child) => isActive(child.href));
  }

  /** Render a single non-group nav link, optionally wrapped in a Tooltip when collapsed */
  function renderNavLink(item: NavItem) {
    const active = isActive(item.href);
    const link = (
      <Link
        href={item.href}
        className={cn(
          "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary/10 text-primary nav-pill-active"
            : "text-text-secondary hover:bg-surface-hover hover:text-text"
        )}
      >
        {item.icon}
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  }

  /** Render a collapsible group (Calculators), optionally with tooltip when collapsed */
  function renderGroupItem(item: NavItem) {
    const groupActive = isGroupActive(item);

    if (collapsed) {
      // When collapsed, show icon only with tooltip; link to first child
      const firstChildHref = item.children?.[0]?.href ?? "#";
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={firstChildHref}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                groupActive
                  ? "bg-primary/10 text-primary nav-pill-active"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text"
              )}
            >
              {item.icon}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <>
        <button
          type="button"
          onClick={() => toggleGroup("calculators")}
          className={cn(
            "relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            groupActive
              ? "bg-primary/10 text-primary nav-pill-active"
              : "text-text-secondary hover:bg-surface-hover hover:text-text"
          )}
        >
          {item.icon}
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              expandedGroups.includes("calculators") && "rotate-180"
            )}
          />
        </button>
        {expandedGroups.includes("calculators") && (
          <ul className="ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
            {item.children!.map((child) => (
              <li key={child.href}>
                <Link
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
                </Link>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-border bg-surface transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex flex-col items-center border-b border-border transition-all duration-300",
          collapsed ? "py-3 px-2" : "py-5 px-4"
        )}>
          <Image
            src="/logo.png"
            alt="Nub"
            width={collapsed ? 36 : 80}
            height={collapsed ? 36 : 80}
            className="rounded-xl transition-all duration-300"
            style={{ width: collapsed ? 36 : 80, height: collapsed ? 36 : 80 }}
            priority
          />
          {!collapsed && (
            <p className="mt-1.5 text-[10px] text-text-muted font-medium tracking-wider uppercase">Retirement Planner</p>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="mt-2 flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text"
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
            {navItems.map((item, index) => (
              <li key={item.href}>
                {/* Section divider between main and secondary nav */}
                {index === DIVIDER_AFTER_INDEX + 1 && (
                  <div className="my-2">
                    <div className="h-px bg-border mx-3" />
                  </div>
                )}
                {item.children
                  ? renderGroupItem(item)
                  : renderNavLink(item)}
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
    </TooltipProvider>
  );
}
