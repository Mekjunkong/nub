"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import type { InsurancePolicy } from "@/types/calculator";

interface InsurancePortfolioCardProps {
  policies: InsurancePolicy[];
}

const policyTypeLabels: Record<InsurancePolicy["type"], string> = {
  wholelife: "Whole Life",
  saving: "Saving",
  annuity: "Annuity",
  term: "Term",
  critical_illness: "CI",
  health: "Health",
};

export function InsurancePortfolioCard({ policies }: InsurancePortfolioCardProps) {
  const [expanded, setExpanded] = useState(false);

  const totalDeath = policies.reduce((sum, p) => sum + p.deathBenefit, 0);
  const totalCI = policies.reduce((sum, p) => sum + p.ciCoverage, 0);
  const totalSurrender = policies.reduce((sum, p) => sum + p.surrenderValue, 0);

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Insurance Portfolio</p>
        </div>

        {policies.length === 0 ? (
          <p className="text-sm text-text-muted py-2">No policies added</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div>
                <p className="text-xs text-text-muted">Death Benefit</p>
                <p className="text-sm font-semibold text-text">{"\u0E3F"}{totalDeath.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">CI Coverage</p>
                <p className="text-sm font-semibold text-text">{"\u0E3F"}{totalCI.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Surrender Value</p>
                <p className="text-sm font-semibold text-text">{"\u0E3F"}{totalSurrender.toLocaleString()}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="flex items-center gap-1 mt-3 text-xs text-primary font-medium hover:underline"
            >
              {expanded ? "Hide" : "Show"} {policies.length} {policies.length === 1 ? "policy" : "policies"}
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {expanded && (
              <div className="mt-2 space-y-2">
                {policies.map((policy) => (
                  <div
                    key={policy.name}
                    className="flex items-center justify-between rounded-lg bg-surface-hover px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text">{policy.name}</span>
                      <Badge variant="primary">{policyTypeLabels[policy.type]}</Badge>
                    </div>
                    <div className="flex gap-3 text-text-muted">
                      <span>{"\u0E3F"}{policy.deathBenefit.toLocaleString()}</span>
                      <span>{"\u0E3F"}{policy.ciCoverage.toLocaleString()}</span>
                      <span>{"\u0E3F"}{policy.surrenderValue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
