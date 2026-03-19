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
