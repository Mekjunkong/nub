"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, Calculator, Activity, BarChart3, MessageCircle,
  Users, User, ChevronLeft, ChevronRight, ChevronDown, TrendingUp,
  Shield, PieChart, DollarSign, Receipt, Landmark, Wallet,
  ClipboardList, GraduationCap, HeartPulse, CreditCard, Umbrella,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./language-toggle";
import { DarkModeToggle } from "./dark-mode-toggle";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/components/ui/tooltip";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: { href: string; label: string; icon: React.ReactNode }[];
}

const DIVIDER_AFTER_INDEX = 3;

export function Sidebar() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["calculators"]);

  const navItems: NavItem[] = [
    { href: `/${locale}/dashboard`, label: t("nav.dashboard"), icon: <LayoutDashboard className="h-5 w-5" /> },
    {
      href: "#calculators",
      label: t("nav.calculators"),
      icon: <Calculator className="h-5 w-5" />,
      children: [
        { href: `/${locale}/calculator/retirement`, label: t("nav.calc.retirement"), icon: <Landmark className="h-4 w-4" /> },
        { href: `/${locale}/calculator/withdrawal`, label: t("nav.calc.withdrawal"), icon: <TrendingUp className="h-4 w-4" /> },
        { href: `/${locale}/calculator/stress-test`, label: t("nav.calc.stressTest"), icon: <Shield className="h-4 w-4" /> },
        { href: `/${locale}/calculator/mpt`, label: t("nav.calc.mpt"), icon: <PieChart className="h-4 w-4" /> },
        { href: `/${locale}/calculator/dca`, label: t("nav.calc.dca"), icon: <DollarSign className="h-4 w-4" /> },
        { href: `/${locale}/calculator/tax`, label: t("nav.calc.tax"), icon: <Receipt className="h-4 w-4" /> },
        { href: `/${locale}/calculator/cashflow`, label: t("nav.calc.cashflow"), icon: <Wallet className="h-4 w-4" /> },
        { href: `/${locale}/calculator/roic`, label: t("nav.calc.roic"), icon: <BarChart3 className="h-4 w-4" /> },
        { href: `/${locale}/calculator/gpf-optimizer`, label: t("nav.calc.gpfOptimizer"), icon: <PieChart className="h-4 w-4" /> },
        { href: `/${locale}/calculator/tipp`, label: t("nav.calc.tipp"), icon: <Shield className="h-4 w-4" /> },
        { href: `/${locale}/calculator/bumnan95`, label: t("nav.calc.bumnan95"), icon: <Calculator className="h-4 w-4" /> },
        { href: `/${locale}/calculator/inflation`, label: t("nav.calc.inflation"), icon: <TrendingDown className="h-4 w-4" /> },
        { href: `/${locale}/calculator/social-security`, label: t("nav.calc.socialSecurity"), icon: <Umbrella className="h-4 w-4" /> },
        { href: `/${locale}/calculator/insurance`, label: t("nav.calc.insurance"), icon: <HeartPulse className="h-4 w-4" /> },
        { href: `/${locale}/calculator/debt-payoff`, label: t("nav.calc.debtPayoff"), icon: <CreditCard className="h-4 w-4" /> },
        { href: `/${locale}/calculator/education`, label: t("nav.calc.education"), icon: <GraduationCap className="h-4 w-4" /> },
        { href: `/${locale}/calculator/compare`, label: t("nav.calc.compare"), icon: <BarChart3 className="h-4 w-4" /> },
      ],
    },
    { href: `/${locale}/action-plan`, label: t("nav.actionPlan"), icon: <ClipboardList className="h-5 w-5" /> },
    { href: `/${locale}/portfolio-health`, label: t("nav.portfolioHealth"), icon: <Activity className="h-5 w-5" /> },
    { href: `/${locale}/funds`, label: t("nav.funds"), icon: <BarChart3 className="h-5 w-5" /> },
    { href: `/${locale}/chat`, label: t("nav.chat"), icon: <MessageCircle className="h-5 w-5" /> },
    { href: `/${locale}/community`, label: t("nav.community"), icon: <Users className="h-5 w-5" /> },
    { href: `/${locale}/profile`, label: t("nav.profile"), icon: <User className="h-5 w-5" /> },
  ];

  function toggleGroup(group: string) {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function isGroupActive(item: NavItem) {
    if (!item.children) return false;
    return item.children.some((child) => isActive(child.href));
  }

  function renderNavLink(item: NavItem) {
    const active = isActive(item.href);
    const link = (
      <Link
        href={item.href}
        className={cn(
          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-primary-light text-primary nav-pill-active shadow-sm"
            : "text-text-secondary hover:bg-surface-hover hover:text-text"
        )}
      >
        <span className={cn("flex-shrink-0 transition-colors", active ? "text-primary" : "text-text-muted")}>
          {item.icon}
        </span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
        </Tooltip>
      );
    }
    return link;
  }

  function renderGroupItem(item: NavItem) {
    const groupActive = isGroupActive(item);
    if (collapsed) {
      const firstChildHref = item.children?.[0]?.href ?? "#";
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={firstChildHref}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                groupActive
                  ? "bg-primary-light text-primary nav-pill-active"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text"
              )}
            >
              <span className={cn("flex-shrink-0", groupActive ? "text-primary" : "text-text-muted")}>
                {item.icon}
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
        </Tooltip>
      );
    }
    return (
      <>
        <button
          type="button"
          onClick={() => toggleGroup("calculators")}
          className={cn(
            "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            groupActive
              ? "bg-primary-light text-primary nav-pill-active"
              : "text-text-secondary hover:bg-surface-hover hover:text-text"
          )}
        >
          <span className={cn("flex-shrink-0", groupActive ? "text-primary" : "text-text-muted")}>
            {item.icon}
          </span>
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200",
              expandedGroups.includes("calculators") && "rotate-180"
            )}
          />
        </button>
        {expandedGroups.includes("calculators") && (
          <ul className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l-2 border-border pl-3">
            {item.children!.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
                    isActive(child.href)
                      ? "bg-primary-light text-primary"
                      : "text-text-muted hover:bg-surface-hover hover:text-text"
                  )}
                >
                  <span className={cn("flex-shrink-0", isActive(child.href) ? "text-primary" : "text-text-muted")}>
                    {child.icon}
                  </span>
                  <span className="truncate">{child.label}</span>
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
          "flex h-screen flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out",
          collapsed ? "w-[60px]" : "w-64"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex flex-col items-center border-b border-border transition-all duration-300",
          collapsed ? "py-3 px-2" : "py-4 px-4"
        )}>
          <div className="relative">
            <Image
              src="/logo.png"
              alt="Nub"
              width={collapsed ? 36 : 44}
              height={collapsed ? 36 : 44}
              className="rounded-xl transition-all duration-300"
              style={{ width: collapsed ? 36 : 44, height: collapsed ? 36 : 44 }}
              priority
            />
          </div>
          {!collapsed && (
            <div className="mt-2 text-center">
              <p className="text-xs font-bold text-text">Nub</p>
              <p className="text-[9px] text-text-muted font-medium tracking-wider uppercase">Retirement Planner</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text transition-all",
              collapsed ? "mt-2" : "mt-2"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item, index) => (
              <li key={item.href}>
                {index === DIVIDER_AFTER_INDEX + 1 && (
                  <div className="my-2 px-2">
                    <div className="h-px bg-border" />
                    {!collapsed && (
                      <p className="mt-2 mb-1 px-2 text-[9px] font-semibold uppercase tracking-widest text-text-muted">
                        Resources
                      </p>
                    )}
                  </div>
                )}
                {item.children ? renderGroupItem(item) : renderNavLink(item)}
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className={cn(
          "border-t border-border transition-all duration-300",
          collapsed ? "p-2" : "p-3"
        )}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <DarkModeToggle />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-text-muted">Settings</span>
              <div className="flex items-center gap-1.5">
                <LanguageToggle />
                <DarkModeToggle />
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
