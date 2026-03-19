"use client";

import { EmergencyFundCard } from "./emergency-fund-card";
import { EducationFundCard } from "./education-fund-card";
import { RetirementWealthCard } from "./retirement-wealth-card";
import { InsurancePortfolioCard } from "./insurance-portfolio-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WealthPillarData } from "@/types/calculator";

interface WealthOverviewProps {
  data: WealthPillarData | null;
}

export function WealthOverview({ data }: WealthOverviewProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wealth Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-text-muted text-sm">
            Set up your wealth pillars to see your overview.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text">Wealth Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EmergencyFundCard
          balance={data.emergency.balance}
          monthlyExpenses={data.emergency.monthlyExpenses}
        />
        <EducationFundCard
          currentAmount={data.education.currentAmount}
          goalAmount={data.education.goalAmount}
          targetDate={data.education.targetDate}
        />
        <RetirementWealthCard
          gpfValue={data.retirement.gpfValue}
          rmfValue={data.retirement.rmfValue}
          otherRetirement={data.retirement.otherRetirement}
          targetCorpus={data.retirement.targetCorpus}
        />
        <InsurancePortfolioCard
          policies={data.insurance.policies}
        />
      </div>
    </div>
  );
}
