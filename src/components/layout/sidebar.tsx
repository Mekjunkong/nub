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

export function Sidebar() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["calculators"]);

  const mainNavItems: NavItem[] = [
    { href: `/${locale}/dashboard`, label: t("nav.dashboard"), icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    {
      href: "#calculators",
      label: t("nav.calculators"),
      icon: <Calculator className="h-4.5 w-4.5" />,
      children: [
        { href: `/${locale}/calculator/retirement`, label: t("nav.calc.retirement"), icon: <Landmark className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/withdrawal`, label: t("nav.calc.withdrawal"), icon: <TrendingUp className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/stress-test`, label: t("nav.calc.stressTest"), icon: <Shield className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/mpt`, label: t("nav.calc.mpt"), icon: <PieChart className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/dca`, label: t("nav.calc.dca"), icon: <DollarSign className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/tax`, label: t("nav.calc.tax"), icon: <Receipt className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/cashflow`, label: t("nav.calc.cashflow"), icon: <Wallet className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/roic`, label: t("nav.calc.roic"), icon: <BarChart3 className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/gpf-optimizer`, label: t("nav.calc.gpfOptimizer"), icon: <PieChart className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/tipp`, label: t("nav.calc.tipp"), icon: <Shield className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/bumnan95`, label: t("nav.calc.bumnan95"), icon: <Calculator className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/inflation`, label: t("nav.calc.inflation"), icon: <TrendingDown className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/social-security`, label: t("nav.calc.socialSecurity"), icon: <Umbrella className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/insurance`, label: t("nav.calc.insurance"), icon: <HeartPulse className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/debt-payoff`, label: t("nav.calc.debtPayoff"), icon: <CreditCard className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/education`, label: t("nav.calc.education"), icon: <GraduationCap className="h-3.5 w-3.5" /> },
        { href: `/${locale}/calculator/compare`, label: t("nav.calc.compare"), icon: <BarChart3 className="h-3.5 w-3.5" /> },
      ],
    },
    { href: `/${locale}/action-plan`, label: t("nav.actionPlan"), icon: <ClipboardList className="h-4.5 w-4.5" /> },
    { href: `/${locale}/portfolio-health`, label: t("nav.portfolioHealth"), icon: <Activity className="h-4.5 w-4.5" /> },
    { href: `/${locale}/funds`, label: t("nav.funds"), icon: <BarChart3 className="h-4.5 w-4.5" /> },
  ];

  const secondaryNavItems: NavItem[] = [
    { href: `/${locale}/chat`, label: t("nav.chat"), icon: <MessageCircle className="h-4.5 w-4.5" /> },
    { href: `/${locale}/community`, label: t("nav.community"), icon: <Users className="h-4.5 w-4.5" /> },
    { href: `/${locale}/profile`, label: t("nav.profile"), icon: <User className="h-4.5 w-4.5" /> },
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
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-primary text-white shadow-sm"
            : "text-text-secondary hover:bg-surface-hover hover:text-text"
        )}
      >
        <span className={cn("flex-shrink-0 transition-colors", active ? "text-white" : "text-text-muted group-hover:text-text")}>
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
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                groupActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text"
              )}
            >
              <span className={cn("flex-shrink-0", groupActive ? "text-white" : "text-text-muted")}>
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
            "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            groupActive
              ? "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:bg-surface-hover hover:text-text"
          )}
        >
          <span className={cn("flex-shrink-0", groupActive ? "text-white" : "text-text-muted group-hover:text-text")}>
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
          <ul className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-border/60 pl-3">
            {item.children!.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
                    isActive(child.href)
                      ? "bg-primary-light text-primary font-semibold"
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
        {/* Header: Logo + Wordmark */}
        <div className={cn(
          "flex items-center border-b border-border/60 transition-all duration-300",
          collapsed ? "justify-center py-4 px-2" : "justify-between py-4 px-4"
        )}>
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2.5 min-w-0">
            <Image
              src="/logo.webp"
              alt="Nub"
              width={32}
              height={32}
              className="rounded-lg flex-shrink-0"
              priority
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold text-text leading-none font-heading">Nub</p>
                <p className="text-[9px] text-text-muted font-medium tracking-widest uppercase mt-0.5">Retirement</p>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text transition-all"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="absolute -right-3 top-[72px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-muted shadow-sm hover:text-text transition-all z-10"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {/* Main nav items */}
          <ul className="flex flex-col gap-0.5">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                {item.children ? renderGroupItem(item) : renderNavLink(item)}
              </li>
            ))}
          </ul>

          {/* Divider + Resources label */}
          <div className="my-3 px-1">
            <div className="h-px bg-border/60" />
            {!collapsed && (
              <p className="mt-3 mb-1 px-2 text-[9px] font-bold uppercase tracking-widest text-text-muted">
                Community
              </p>
            )}
          </div>

          {/* Secondary nav items */}
          <ul className="flex flex-col gap-0.5">
            {secondaryNavItems.map((item) => (
              <li key={item.href}>
                {renderNavLink(item)}
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom settings */}
        <div className={cn(
          "border-t border-border/60 transition-all duration-300",
          collapsed ? "p-2" : "p-3"
        )}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <DarkModeToggle />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">Preferences</span>
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
