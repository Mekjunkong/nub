"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, GraduationCap } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { SavePlanButton } from "@/components/calculator/shared/save-plan-button";
import { calculateEducationFund } from "@/workers/education-fund.worker";
import { formatThaiCurrency, cn } from "@/lib/utils";
import { track, Events } from "@/lib/analytics";
import type {
  ChildProfile,
  UniversityTier,
  EducationFundResults,
} from "@/types/calculator";

const TIER_OPTIONS: {
  value: UniversityTier;
  label: string;
  cost: string;
  description: string;
}[] = [
  { value: "public", label: "Public", cost: "฿50K/year", description: "State university" },
  { value: "private", label: "Private", cost: "฿150K/year", description: "Private university" },
  {
    value: "international",
    label: "International",
    cost: "฿400K/year",
    description: "International program",
  },
];

const BAR_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function makeChild(index: number): ChildProfile {
  return { name: `Child ${index + 1}`, currentAge: 5, enrollmentAge: 18 };
}

export default function EducationFundPage() {
  const [children, setChildren] = useState<ChildProfile[]>([makeChild(0)]);
  const [tier, setTier] = useState<UniversityTier>("public");
  const [yearsOfStudy, setYearsOfStudy] = useState(4);
  const [educationInflation, setEducationInflation] = useState(5);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [expectedReturn, setExpectedReturn] = useState(6);
  const [results, setResults] = useState<EducationFundResults | null>(null);
  const [calculating, setCalculating] = useState(false);

  function addChild() {
    setChildren((prev) => [...prev, makeChild(prev.length)]);
  }

  function removeChild(index: number) {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  }

  function updateChild(index: number, field: keyof ChildProfile, value: string | number) {
    setChildren((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  const handleCalculate = useCallback(() => {
    setCalculating(true);
    requestAnimationFrame(() => {
      const result = calculateEducationFund({
        children,
        universityTier: tier,
        yearsOfStudy,
        educationInflation: educationInflation / 100,
        currentSavings,
        expectedReturn: expectedReturn / 100,
      });
      setResults(result);
      track(Events.CALCULATOR_COMPLETED, { type: "education" });
      setCalculating(false);
    });
  }, [children, tier, yearsOfStudy, educationInflation, currentSavings, expectedReturn]);

  const chartData = results
    ? results.children.map((c) => ({
        name: c.name,
        monthlySavings: Math.round(c.requiredMonthlySavings),
      }))
    : [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="page-header-gradient">
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <GraduationCap className="h-6 w-6" />
          Education Fund Calculator
        </h1>
        <p className="text-sm mt-1 text-white/80">
          Plan and save for your children&apos;s university education
        </p>
      </div>

      {/* Child Profiles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Child Profiles</CardTitle>
            <Button variant="outline" size="sm" onClick={addChild}>
              <Plus className="h-4 w-4 mr-1" />
              Add Child
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {children.map((child, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row gap-3 items-start sm:items-end rounded-lg border p-4"
            >
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <Input
                  value={child.name}
                  onChange={(e) => updateChild(i, "name", e.target.value)}
                  placeholder="Child name"
                />
              </div>
              <div className="w-28 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Current Age
                </label>
                <Input
                  type="number"
                  min={0}
                  max={25}
                  value={child.currentAge}
                  onChange={(e) => updateChild(i, "currentAge", Number(e.target.value))}
                />
              </div>
              <div className="w-32 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Enrollment Age
                </label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={child.enrollmentAge}
                  onChange={(e) => updateChild(i, "enrollmentAge", Number(e.target.value))}
                />
              </div>
              {children.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-destructive"
                  onClick={() => removeChild(i)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* University Tier */}
      <Card>
        <CardHeader>
          <CardTitle>University Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TIER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTier(opt.value)}
                className={cn(
                  "rounded-lg border-2 p-4 text-left transition-colors",
                  tier === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/40"
                )}
              >
                <p className="font-semibold">{opt.label}</p>
                <p className="text-lg font-bold text-primary">{opt.cost}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Years of Study</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={yearsOfStudy}
                onChange={(e) => setYearsOfStudy(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Education Inflation (%)</label>
              <Input
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={educationInflation}
                onChange={(e) => setEducationInflation(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Current Savings for Education</label>
              <Input
                type="number"
                min={0}
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Expected Investment Return (%)</label>
              <Input
                type="number"
                min={0}
                max={30}
                step={0.5}
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleCalculate} loading={calculating}>
              Calculate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="stagger-children flex flex-col gap-6">
          {/* Export / Save */}
          <div className="flex justify-end gap-2">
            <SavePlanButton
              planType="education"
              inputs={{ children, tier, yearsOfStudy, educationInflation, currentSavings, expectedReturn } as unknown as Record<string, unknown>}
              results={results as unknown as Record<string, unknown>}
            />
            <ExportPdfButton
              planType="education"
              planName="Education Fund Plan"
              inputs={{ children, tier, yearsOfStudy, educationInflation, currentSavings, expectedReturn } as unknown as Record<string, unknown>}
              results={results as unknown as Record<string, unknown>}
            />
          </div>

          {/* Per-child cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.children.map((child, i) => (
              <Card key={i} variant="elevated">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{child.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Years until enrollment</span>
                    <span className="font-medium">{child.yearsUntilEnrollment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Future total cost</span>
                    <span className="font-medium">
                      {formatThaiCurrency(child.futureTotalCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly savings needed</span>
                    <span className="font-bold text-primary">
                      {formatThaiCurrency(child.requiredMonthlySavings)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Required Monthly Savings per Child</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v: number) => `฿${(v / 1000).toFixed(0)}K`} />
                    <Tooltip
                      formatter={(value) => [formatThaiCurrency(Number(value)), "Monthly Savings"]}
                    />
                    <Bar dataKey="monthlySavings" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gap Summary */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Funding Gap Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Future Cost</p>
                  <p className="text-xl font-bold">
                    {formatThaiCurrency(results.totalFutureCost)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Savings (FV)
                  </p>
                  <p className="text-xl font-bold">
                    {formatThaiCurrency(results.currentSavingsFV)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gap</p>
                  <p
                    className={cn(
                      "text-xl font-bold",
                      results.gap <= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {results.gap <= 0 ? "Fully Funded" : formatThaiCurrency(results.gap)}
                  </p>
                  <Badge variant={results.gap <= 0 ? "success" : "danger"} className="mt-1">
                    {results.gap <= 0 ? "On Track" : "Gap Exists"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total monthly callout */}
          <Card className="border-primary bg-primary/5">
            <CardContent className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Total Monthly Savings Needed
              </p>
              <p className="text-3xl font-bold text-primary">
                {formatThaiCurrency(results.totalMonthlySavings)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                across all children
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
