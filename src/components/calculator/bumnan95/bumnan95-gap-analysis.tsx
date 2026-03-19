"use client";

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
  const isSafe = gapStatus === "SAFE";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retirement Gap Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">Target Corpus</p>
            <p className="mt-1 text-xl font-bold text-text">฿{targetCorpus.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">Estimated GPF</p>
            <p className="mt-1 text-xl font-bold text-text">฿{estimatedGPF.toLocaleString()}</p>
          </div>
          <div className={`rounded-lg p-4 ${isSafe ? "bg-success/10" : "bg-danger/10"}`}>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-text-muted uppercase">Retirement Gap</p>
              <Badge variant={isSafe ? "success" : "danger"}>{isSafe ? "SAFE" : "GAP EXISTS"}</Badge>
            </div>
            <p className={`mt-1 text-xl font-bold ${isSafe ? "text-success" : "text-danger"}`}>
              ฿{Math.abs(retirementGap).toLocaleString()}
              {isSafe ? " surplus" : " shortfall"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
