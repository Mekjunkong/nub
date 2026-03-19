"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RiskCommentaryProps {
  performanceComment: string;
  riskComment: string;
}

export function RiskCommentary({ performanceComment, riskComment }: RiskCommentaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Commentary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-xl border border-border bg-surface-hover p-4">
          <p className="text-xs font-medium text-text-muted mb-1">Performance</p>
          <p className="text-sm text-text">{performanceComment}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-hover p-4">
          <p className="text-xs font-medium text-text-muted mb-1">Risk</p>
          <p className="text-sm text-text">{riskComment}</p>
        </div>
      </CardContent>
    </Card>
  );
}
