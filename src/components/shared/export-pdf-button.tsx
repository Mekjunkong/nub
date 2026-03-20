"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import type { PlanType } from "@/types/database";

interface ExportPdfButtonProps {
  planType: PlanType;
  planName: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
}

export function ExportPdfButton({ planType, planName, inputs, results }: ExportPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const t = useTranslations("common");

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType,
          planName,
          generatedAt: new Date().toISOString(),
          locale,
          inputs,
          results,
        }),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const html = await res.text();
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    } catch {
      // Silently fail — button resets
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading} className="gap-1.5">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      {t("save")} PDF
    </Button>
  );
}
