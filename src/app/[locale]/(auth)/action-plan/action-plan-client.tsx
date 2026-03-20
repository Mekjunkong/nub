"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Priority = "critical" | "important" | "nice";

interface ActionItem {
  id: string;
  priority: Priority;
  title: string;
  description: string;
  calculatorLink: string;
  calculatorLabel: string;
}

interface ActionPlanClientProps {
  plans: Record<string, Record<string, unknown>>;
}

const priorityConfig: Record<
  Priority,
  { color: string; icon: typeof AlertTriangle; badgeVariant: "danger" | "warning" | "secondary" }
> = {
  critical: { color: "text-danger", icon: AlertTriangle, badgeVariant: "danger" },
  important: { color: "text-warning", icon: Info, badgeVariant: "warning" },
  nice: { color: "text-success", icon: Lightbulb, badgeVariant: "secondary" },
};

export function ActionPlanClient({ plans }: ActionPlanClientProps) {
  const locale = useLocale();
  const t = useTranslations("common");

  const actions = useMemo(() => {
    const items: ActionItem[] = [];

    // Analyze retirement plan
    const retirement = plans.retirement;
    if (retirement) {
      const gap = retirement.gap as number | undefined;
      const fundedRatio = retirement.fundedRatio as number | undefined;
      const healthScore = retirement.healthScore as number | undefined;

      if (gap != null && gap > 0) {
        items.push({
          id: "retirement-gap",
          priority: gap > 1000000 ? "critical" : "important",
          title: "Close Your Retirement Gap",
          description: `You have a \u0E3F${Math.round(gap).toLocaleString()} gap. Consider increasing monthly savings or adjusting your retirement age.`,
          calculatorLink: `/${locale}/calculator/retirement`,
          calculatorLabel: t("planTypes.retirement"),
        });
      }
      if (fundedRatio != null && fundedRatio < 0.5) {
        items.push({
          id: "low-funded",
          priority: "critical",
          title: "Increase Savings Rate",
          description: `You're only ${(fundedRatio * 100).toFixed(0)}% funded for retirement. Aim for at least 80%.`,
          calculatorLink: `/${locale}/calculator/retirement`,
          calculatorLabel: t("planTypes.retirement"),
        });
      }
      if (healthScore != null && healthScore < 50) {
        items.push({
          id: "low-health",
          priority: "critical",
          title: "Improve Financial Health Score",
          description: `Your score is ${healthScore.toFixed(0)} — aim for 70+. Review your overall financial picture.`,
          calculatorLink: `/${locale}/portfolio-health`,
          calculatorLabel: t("planTypes.portfolio_health"),
        });
      }
    }

    // Analyze withdrawal plan
    const withdrawal = plans.withdrawal;
    if (withdrawal) {
      const survivalRate = withdrawal.survivalRate as number | undefined;
      if (survivalRate != null && survivalRate < 0.9) {
        items.push({
          id: "low-survival",
          priority: survivalRate < 0.7 ? "critical" : "important",
          title: "Reduce Withdrawal Risk",
          description: `Your ${(survivalRate * 100).toFixed(0)}% survival rate is below the safe threshold. Consider reducing withdrawals or building a larger corpus.`,
          calculatorLink: `/${locale}/calculator/withdrawal`,
          calculatorLabel: t("planTypes.withdrawal"),
        });
      }
    }

    // Analyze tax plan
    const tax = plans.tax;
    if (tax) {
      const optimized = tax.optimized as Record<string, unknown> | undefined;
      const current = tax.current as Record<string, unknown> | undefined;
      if (optimized && current) {
        const currentTax = current.totalTax as number | undefined;
        const optimizedTax = optimized.totalTax as number | undefined;
        if (currentTax != null && optimizedTax != null && currentTax > optimizedTax) {
          const savings = currentTax - optimizedTax;
          items.push({
            id: "tax-savings",
            priority: savings > 50000 ? "important" : "nice",
            title: "Optimize Your Tax Deductions",
            description: `You could save \u0E3F${Math.round(savings).toLocaleString()} per year by maximizing your deductions.`,
            calculatorLink: `/${locale}/calculator/tax`,
            calculatorLabel: t("planTypes.tax"),
          });
        }
      }
    }

    // Analyze stress test
    const stress = plans.stress_test;
    if (stress) {
      const worstDrawdown = stress.worstDrawdown as number | undefined;
      if (worstDrawdown != null && worstDrawdown > 0.4) {
        items.push({
          id: "high-drawdown",
          priority: "important",
          title: "Reduce Portfolio Drawdown Risk",
          description: `Your worst-case drawdown is ${(worstDrawdown * 100).toFixed(0)}%. Consider diversifying into less correlated assets.`,
          calculatorLink: `/${locale}/calculator/stress-test`,
          calculatorLabel: t("planTypes.stress_test"),
        });
      }
    }

    // Analyze portfolio health
    const health = plans.portfolio_health;
    if (health) {
      const overallScore = health.overallScore as number | undefined;
      if (overallScore != null && overallScore < 60) {
        items.push({
          id: "portfolio-health",
          priority: "important",
          title: "Rebalance Your Portfolio",
          description: `Your portfolio health score is ${overallScore.toFixed(0)}. Consider rebalancing for better risk-adjusted returns.`,
          calculatorLink: `/${locale}/portfolio-health`,
          calculatorLabel: t("planTypes.portfolio_health"),
        });
      }
    }

    // General recommendations if few plans exist
    const planCount = Object.keys(plans).length;
    if (!plans.retirement) {
      items.push({
        id: "no-retirement",
        priority: planCount === 0 ? "critical" : "important",
        title: "Run a Retirement Analysis",
        description: "Start with the retirement calculator to understand your baseline financial position.",
        calculatorLink: `/${locale}/calculator/retirement`,
        calculatorLabel: t("planTypes.retirement"),
      });
    }
    if (!plans.tax && planCount > 0) {
      items.push({
        id: "no-tax",
        priority: "nice",
        title: "Check Your Tax Optimization",
        description: "Many people miss deductions. Run the tax calculator to find potential savings.",
        calculatorLink: `/${locale}/calculator/tax`,
        calculatorLabel: t("planTypes.tax"),
      });
    }

    // Sort by priority
    const priorityOrder: Record<Priority, number> = { critical: 0, important: 1, nice: 2 };
    return items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [plans, locale, t]);

  // Build PDF sections from actions
  const pdfSections = actions.map((a) => ({
    label: `[${a.priority.toUpperCase()}] ${a.title}`,
    value: a.description,
  }));

  if (Object.keys(plans).length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center animate-fade-in">
        <ClipboardList className="h-12 w-12 text-text-muted" />
        <h2 className="text-xl font-bold text-text">No Plans Yet</h2>
        <p className="text-sm text-text-muted max-w-md">
          Run your first calculator to get personalized action items.
        </p>
        <Link
          href={`/${locale}/calculator/retirement`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Start with Retirement <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const criticalCount = actions.filter((a) => a.priority === "critical").length;
  const importantCount = actions.filter((a) => a.priority === "important").length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text font-heading">Your Action Plan</h1>
            <p className="text-sm text-text-muted">
              Personalized recommendations based on your {Object.keys(plans).length} saved calculator results.
            </p>
          </div>
          <ExportPdfButton
            planType="retirement"
            planName="Action Plan"
            inputs={{}}
            results={{ actions: pdfSections }}
          />
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2">
        {criticalCount > 0 && (
          <Badge variant="danger">{criticalCount} Critical</Badge>
        )}
        {importantCount > 0 && (
          <Badge variant="warning">{importantCount} Important</Badge>
        )}
        <Badge variant="secondary">{actions.length} Total Actions</Badge>
      </div>

      {/* Action cards */}
      <div className="stagger-children flex flex-col gap-3">
        {actions.map((action) => {
          const config = priorityConfig[action.priority];
          const Icon = config.icon;
          return (
            <Card key={action.id}>
              <CardContent className="flex items-start gap-4 py-4">
                <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-text">{action.title}</h3>
                  </div>
                  <p className="text-sm text-text-muted">{action.description}</p>
                </div>
                <Link
                  href={action.calculatorLink}
                  className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0"
                >
                  {action.calculatorLabel} <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion indicator */}
      {criticalCount === 0 && (
        <Card variant="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle2 className="h-6 w-6 text-success" />
            <div>
              <p className="text-sm font-semibold text-text">Looking Good!</p>
              <p className="text-xs text-text-muted">No critical issues found. Keep monitoring your progress.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
