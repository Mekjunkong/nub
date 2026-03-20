"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { SavePlanButton } from "@/components/calculator/shared/save-plan-button";
import { calculateSocialSecurity } from "@/workers/social-security.worker";
import { formatThaiCurrency } from "@/lib/utils";
import { track, Events } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type {
  SocialSecurityInputs,
  SocialSecurityResults,
  SocialSecuritySection,
} from "@/types/calculator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const SECTION_INFO: {
  value: SocialSecuritySection;
  title: string;
  desc: string;
}[] = [
  {
    value: "33",
    title: "Section 33 - Employed",
    desc: "For employees with employer matching. Max base 15,000 THB/month.",
  },
  {
    value: "39",
    title: "Section 39 - Voluntary",
    desc: "For those who left employment. Fixed 432 THB/month contribution.",
  },
  {
    value: "40",
    title: "Section 40 - Self-Employed",
    desc: "For freelancers. Lump-sum payout only, no monthly pension.",
  },
];

const BAR_COLORS = ["#6366f1", "#f59e0b", "#10b981"];

const RECOMMENDATION_REASONS: Record<string, string> = {
  "33": "Section 33 provides the highest pension-to-contribution ratio for employed individuals with employer matching.",
  "39": "Section 39 offers a reasonable pension with lower fixed contributions for those who left employment.",
  "40": "Section 40 has no monthly pension benefit. Consider Section 33 or 39 if eligible.",
};

export default function SocialSecurityPage() {
  const t = useTranslations("common");

  const [section, setSection] = useState<SocialSecuritySection>("33");
  const [monthlyIncome, setMonthlyIncome] = useState(40000);
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(55);
  const [yearsContributed, setYearsContributed] = useState(5);
  const [results, setResults] = useState<SocialSecurityResults | null>(null);
  const [calculating, setCalculating] = useState(false);

  function handleCalculate() {
    setCalculating(true);
    requestAnimationFrame(() => {
      const inputs: SocialSecurityInputs = {
        section,
        monthlyIncome,
        currentAge,
        retirementAge,
        yearsContributed,
      };
      const result = calculateSocialSecurity(inputs);
      setResults(result);
      track(Events.CALCULATOR_COMPLETED, { type: "social_security" });
      setCalculating(false);
    });
  }

  const chartData = results
    ? results.sections.map((s) => ({
        section: `Sec. ${s.section}`,
        pension: s.monthlyPension,
      }))
    : [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <h1 className="text-2xl font-bold font-heading">
          Social Security Optimizer
        </h1>
        <p className="text-sm mt-1 text-white/80">
          Compare Thai Social Security sections and find the best option for you
        </p>
      </div>

      {/* Section Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SECTION_INFO.map((info) => (
              <button
                key={info.value}
                type="button"
                onClick={() => setSection(info.value)}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition-all",
                  section === info.value
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-surface-hover"
                )}
              >
                <div className="font-semibold text-sm">{info.title}</div>
                <div className="mt-1 text-xs text-text-muted">{info.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Monthly Income (THB)"
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              min={0}
            />
            <Input
              label="Current Age"
              type="number"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              min={15}
              max={70}
            />
            <Input
              label="Retirement Age"
              type="number"
              value={retirementAge}
              onChange={(e) => setRetirementAge(Number(e.target.value))}
              min={50}
              max={70}
            />
            <Input
              label="Years Already Contributed"
              type="number"
              value={yearsContributed}
              onChange={(e) => setYearsContributed(Number(e.target.value))}
              min={0}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleCalculate} loading={calculating}>
              {t("calculate")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="stagger-children flex flex-col gap-6">
          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <SavePlanButton
              planType="social_security"
              inputs={
                {
                  section,
                  monthlyIncome,
                  currentAge,
                  retirementAge,
                  yearsContributed,
                } as unknown as Record<string, unknown>
              }
              results={results as unknown as Record<string, unknown>}
            />
            <ExportPdfButton
              planType="social_security"
              planName="Social Security Comparison"
              inputs={
                {
                  section,
                  monthlyIncome,
                  currentAge,
                  retirementAge,
                  yearsContributed,
                } as unknown as Record<string, unknown>
              }
              results={results as unknown as Record<string, unknown>}
            />
          </div>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Pension Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="section" />
                    <YAxis
                      tickFormatter={(v: number) =>
                        formatThaiCurrency(v, { maximumFractionDigits: 0 })
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatThaiCurrency(Number(value)),
                        "Monthly Pension",
                      ]}
                    />
                    <Bar dataKey="pension" radius={[6, 6, 0, 0]}>
                      {chartData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={BAR_COLORS[index % BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Section Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-text-muted">
                        Section
                      </th>
                      <th className="pb-3 font-medium text-text-muted text-right">
                        Monthly Contribution
                      </th>
                      <th className="pb-3 font-medium text-text-muted text-right">
                        Monthly Pension
                      </th>
                      <th className="pb-3 font-medium text-text-muted text-right">
                        Total Contributed
                      </th>
                      <th className="pb-3 font-medium text-text-muted text-right">
                        Break-even (Years)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.sections.map((s) => (
                      <tr
                        key={s.section}
                        className={cn(
                          "border-b border-border/50",
                          s.section === results.recommended &&
                            "bg-primary/5 font-medium"
                        )}
                      >
                        <td className="py-3">
                          Section {s.section}
                          {s.section === results.recommended && (
                            <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                              Best
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {formatThaiCurrency(s.monthlyContribution)}
                        </td>
                        <td className="py-3 text-right">
                          {s.monthlyPension > 0
                            ? formatThaiCurrency(s.monthlyPension)
                            : "N/A"}
                        </td>
                        <td className="py-3 text-right">
                          {formatThaiCurrency(s.totalContributed)}
                        </td>
                        <td className="py-3 text-right">
                          {s.breakEvenYears === Infinity
                            ? "N/A"
                            : `${s.breakEvenYears.toFixed(1)} yrs`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card variant="gradient">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary text-lg">
                  💡
                </div>
                <div>
                  <div className="font-semibold">
                    Recommendation: Section {results.recommended}
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {RECOMMENDATION_REASONS[results.recommended]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
