"use client";

import { useState } from "react";
import { EmergencyFundCard } from "./emergency-fund-card";
import { EducationFundCard } from "./education-fund-card";
import { RetirementWealthCard } from "./retirement-wealth-card";
import { InsurancePortfolioCard } from "./insurance-portfolio-card";
import { WealthPillarEditor } from "./wealth-pillar-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { WealthPillarData } from "@/types/calculator";

interface WealthOverviewProps {
  data: WealthPillarData | null;
  onSave?: (data: WealthPillarData) => void;
}

export function WealthOverview({ data, onSave }: WealthOverviewProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const handleSave = (updated: WealthPillarData) => {
    onSave?.(updated);
  };

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Wealth Overview</CardTitle>
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditorOpen(true)}
              >
                Edit Wealth Data
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-text-muted text-sm">
            Set up your wealth pillars to see your overview.
          </div>
        </CardContent>
        <WealthPillarEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          data={data}
          onSave={handleSave}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">Wealth Overview</h2>
        {onSave && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditorOpen(true)}
          >
            Edit Wealth Data
          </Button>
        )}
      </div>
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
      <WealthPillarEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        data={data}
        onSave={handleSave}
      />
    </div>
  );
}
