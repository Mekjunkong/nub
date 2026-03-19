/**
 * PDF Generator for Nub Calculator Results
 *
 * Uses @react-pdf/renderer to create branded PDFs.
 * Called server-side from the /api/pdf route.
 */

import { formatThaiCurrency } from "@/lib/utils";

export interface PdfData {
  planType: string;
  planName: string;
  generatedAt: string;
  locale: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
}

/**
 * Generate PDF content as a simplified structure.
 * The actual @react-pdf/renderer components are used in the API route.
 */
export function formatPdfData(data: PdfData): {
  title: string;
  subtitle: string;
  sections: { label: string; value: string }[];
  disclaimer: string;
} {
  const isThaiLocale = data.locale === "th";
  const planLabels: Record<string, string> = {
    retirement: isThaiLocale ? "แผนเกษียณ" : "Retirement Plan",
    withdrawal: isThaiLocale ? "แผนถอนเงิน" : "Withdrawal Plan",
    stress_test: isThaiLocale ? "ทดสอบความเครียด" : "Stress Test",
    mpt: isThaiLocale ? "จัดพอร์ต MPT" : "MPT Portfolio",
    dca: isThaiLocale ? "DCA" : "DCA Strategy",
    tax: isThaiLocale ? "วางแผนภาษี" : "Tax Plan",
    cashflow: isThaiLocale ? "กระแสเงินสด" : "Cashflow",
    roic: isThaiLocale ? "ROIC" : "ROIC Analysis",
    gpf_optimizer: isThaiLocale ? "จัด กบข." : "GPF Optimizer",
    tipp: isThaiLocale ? "TIPP/VPPI" : "TIPP/VPPI Protection",
    bumnan95: isThaiLocale ? "บำนาญ 95" : "Bumnan 95",
    portfolio_health: isThaiLocale ? "สุขภาพพอร์ต" : "Portfolio Health",
  };

  const formatCurrency = (v: number) => formatThaiCurrency(v);

  const sections: { label: string; value: string }[] = [];

  // Extract key results based on plan type
  const r = data.results;
  if (data.planType === "retirement") {
    sections.push(
      { label: "Health Score", value: String(r.healthScore ?? "N/A") },
      { label: "Retirement Gap", value: formatCurrency(Number(r.gap ?? 0)) },
      { label: "Required Corpus", value: formatCurrency(Number(r.requiredCorpus ?? 0)) },
      { label: "Projected Corpus", value: formatCurrency(Number(r.projectedCorpus ?? 0)) },
      { label: "Monthly Shortfall", value: formatCurrency(Number(r.monthlyShortfall ?? 0)) },
    );
  } else if (data.planType === "withdrawal") {
    sections.push(
      { label: "Survival Rate", value: `${((Number(r.survivalRate ?? 0)) * 100).toFixed(1)}%` },
      { label: "Median Final Wealth", value: formatCurrency(Number(r.medianFinalWealth ?? 0)) },
    );
  } else if (data.planType === "tax") {
    sections.push(
      { label: "Current Tax", value: formatCurrency(Number(r.currentTax ?? 0)) },
      { label: "Optimized Tax", value: formatCurrency(Number(r.optimizedTax ?? 0)) },
      { label: "Tax Saved", value: formatCurrency(Number(r.taxSaved ?? 0)) },
    );
  } else if (data.planType === "mpt") {
    const maxSharpe = r.maxSharpe as Record<string, unknown> | undefined;
    sections.push(
      { label: "Max Sharpe Return", value: `${(Number(maxSharpe?.expectedReturn ?? 0) * 100).toFixed(2)}%` },
      { label: "Max Sharpe Risk", value: `${(Number(maxSharpe?.risk ?? 0) * 100).toFixed(2)}%` },
      { label: "Sharpe Ratio", value: String(Number(maxSharpe?.sharpeRatio ?? 0).toFixed(3)) },
    );
  } else if (data.planType === "stress_test") {
    const scenarios = r.scenarios as Array<Record<string, unknown>> | undefined;
    if (scenarios && scenarios.length > 0) {
      for (const s of scenarios.slice(0, 3)) {
        sections.push({
          label: String(s.name ?? "Scenario"),
          value: `${(Number(s.portfolioReturn ?? 0) * 100).toFixed(1)}% return`,
        });
      }
    }
    sections.push(
      { label: "Worst Case", value: `${(Number(r.worstCase ?? 0) * 100).toFixed(1)}%` },
    );
  } else if (data.planType === "dca") {
    sections.push(
      { label: "Total Invested", value: formatCurrency(Number(r.totalInvested ?? 0)) },
      { label: "Final Value", value: formatCurrency(Number(r.finalValue ?? 0)) },
      { label: "Total Return", value: `${(Number(r.totalReturn ?? 0) * 100).toFixed(2)}%` },
    );
  } else if (data.planType === "cashflow") {
    sections.push(
      { label: "Total Income", value: formatCurrency(Number(r.totalIncome ?? 0)) },
      { label: "Total Expenses", value: formatCurrency(Number(r.totalExpenses ?? 0)) },
      { label: "Net Cashflow", value: formatCurrency(Number(r.netCashflow ?? 0)) },
      { label: "Savings Rate", value: `${(Number(r.savingsRate ?? 0) * 100).toFixed(1)}%` },
    );
  } else if (data.planType === "roic") {
    sections.push(
      { label: "ROIC", value: `${(Number(r.roic ?? 0) * 100).toFixed(2)}%` },
      { label: "WACC", value: `${(Number(r.wacc ?? 0) * 100).toFixed(2)}%` },
      { label: "Economic Profit", value: formatCurrency(Number(r.economicProfit ?? 0)) },
    );
  } else if (data.planType === "gpf_optimizer") {
    sections.push(
      { label: "Optimal Return", value: `${(Number(r.optimalReturn ?? 0) * 100).toFixed(2)}%` },
      { label: "Optimal Risk", value: `${(Number(r.optimalRisk ?? 0) * 100).toFixed(2)}%` },
      { label: "Projected Wealth (20y)", value: formatCurrency(Number(r.projectedWealth ?? 0)) },
    );
  } else if (data.planType === "tipp") {
    sections.push(
      { label: "Final Wealth", value: formatCurrency(Number(r.finalWealth ?? 0)) },
      { label: "Risky Weight", value: `${(Number(r.riskyWeight ?? 0) * 100).toFixed(1)}%` },
      { label: "Safe Weight", value: `${(Number(r.safeWeight ?? 0) * 100).toFixed(1)}%` },
      { label: "Max Drawdown", value: `${(Number(r.maxDrawdown ?? 0) * 100).toFixed(1)}%` },
    );
  } else if (data.planType === "bumnan95") {
    sections.push(
      { label: "Target Corpus", value: formatCurrency(Number(r.targetCorpus ?? 0)) },
      { label: "Retirement Gap", value: formatCurrency(Number(r.retirementGap ?? 0)) },
      { label: "Annual Premium", value: formatCurrency(Number(r.annualPremium ?? 0)) },
      { label: "Monthly Top-Up", value: formatCurrency(Number(r.monthlyTopUp ?? 0)) },
    );
  } else if (data.planType === "portfolio_health") {
    sections.push(
      { label: "Portfolio Return", value: `${(Number(r.portfolioReturn ?? 0) * 100).toFixed(2)}%` },
      { label: "Portfolio Risk", value: `${(Number(r.portfolioRisk ?? 0) * 100).toFixed(2)}%` },
      { label: "Sharpe Ratio", value: String(Number(r.sharpeRatio ?? 0).toFixed(3)) },
      { label: "Max Drawdown", value: `${(Number(r.maxDrawdown ?? 0) * 100).toFixed(1)}%` },
    );
  }

  return {
    title: `Nub - ${planLabels[data.planType] || data.planType}`,
    subtitle: data.planName || "Financial Plan Report",
    sections,
    disclaimer: isThaiLocale
      ? "ผลลัพธ์จากการคำนวณเป็นเพียงการประมาณการเท่านั้น ไม่ถือเป็นคำแนะนำทางการเงิน"
      : "Results are estimates only and do not constitute financial advice.",
  };
}
