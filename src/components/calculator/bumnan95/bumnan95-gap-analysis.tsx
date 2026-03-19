"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Bumnan95GapAnalysisProps {
  targetCorpus: number;
  estimatedGPF: number;
  pensionLumpSum: number;
  retirementGap: number;
  gapStatus: "SAFE" | "GAP_EXISTS";
}

export function Bumnan95GapAnalysis({
  targetCorpus,
  estimatedGPF,
  retirementGap,
  gapStatus,
}: Bumnan95GapAnalysisProps) {
  const t = useTranslations("calculator");
  const isSafe = gapStatus === "SAFE";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("bumnan95.gapAnalysis")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">{t("bumnan95.targetCorpus")}</p>
            <p className="mt-1 text-xl font-bold text-text">฿{targetCorpus.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">{t("bumnan95.estimatedGPF")}</p>
            <p className="mt-1 text-xl font-bold text-text">฿{estimatedGPF.toLocaleString()}</p>
          </div>
          <div className={`rounded-lg p-4 ${isSafe ? "bg-success/10" : "bg-danger/10"}`}>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-text-muted uppercase">{t("bumnan95.retirementGap")}</p>
              <Badge variant={isSafe ? "success" : "danger"}>{isSafe ? t("bumnan95.safe") : t("bumnan95.gapExists")}</Badge>
            </div>
            <p className={`mt-1 text-xl font-bold ${isSafe ? "text-success" : "text-danger"}`}>
              ฿{Math.abs(retirementGap).toLocaleString()}
              {isSafe ? ` ${t("bumnan95.surplus")}` : ` ${t("bumnan95.shortfall")}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
