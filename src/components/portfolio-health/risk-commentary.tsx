"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RiskCommentaryProps {
  performanceComment: string;
  riskComment: string;
}

export function RiskCommentary({ performanceComment, riskComment }: RiskCommentaryProps) {
  const t = useTranslations("portfolioHealth");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("riskCommentary")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-xl border border-border bg-surface-hover p-4">
          <p className="text-xs font-medium text-text-muted mb-1">{t("performance")}</p>
          <p className="text-sm text-text">{performanceComment}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-hover p-4">
          <p className="text-xs font-medium text-text-muted mb-1">{t("riskLabel")}</p>
          <p className="text-sm text-text">{riskComment}</p>
        </div>
      </CardContent>
    </Card>
  );
}
