"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { WealthPillarData, InsurancePolicy } from "@/types/calculator";

interface WealthPillarEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: WealthPillarData | null;
  onSave: (data: WealthPillarData) => void;
}

const POLICY_TYPES = [
  { value: "wholelife", label: "Whole Life" },
  { value: "saving", label: "Saving" },
  { value: "annuity", label: "Annuity" },
  { value: "term", label: "Term" },
  { value: "critical_illness", label: "Critical Illness" },
  { value: "health", label: "Health" },
] as const;

function defaultData(): WealthPillarData {
  return {
    emergency: {
      balance: 0,
      monthlyExpenses: 0,
      monthsCoverage: 0,
      status: "WEAK",
    },
    education: {
      currentAmount: 0,
      goalAmount: 0,
      progressPercent: 0,
      targetDate: "",
    },
    retirement: {
      gpfValue: 0,
      rmfValue: 0,
      otherRetirement: 0,
      totalRetirement: 0,
      targetCorpus: 0,
      progressPercent: 0,
    },
    insurance: {
      totalDeathBenefit: 0,
      totalCICoverage: 0,
      totalSurrenderValue: 0,
      policies: [],
    },
  };
}

function computeDerived(draft: WealthPillarData): WealthPillarData {
  const monthsCoverage =
    draft.emergency.monthlyExpenses > 0
      ? draft.emergency.balance / draft.emergency.monthlyExpenses
      : 0;
  const emergencyStatus: WealthPillarData["emergency"]["status"] =
    monthsCoverage >= 6 ? "STRONG" : monthsCoverage >= 3 ? "MODERATE" : "WEAK";

  const educationProgress =
    draft.education.goalAmount > 0
      ? (draft.education.currentAmount / draft.education.goalAmount) * 100
      : 0;

  const totalRetirement =
    draft.retirement.gpfValue +
    draft.retirement.rmfValue +
    draft.retirement.otherRetirement;
  const retirementProgress =
    draft.retirement.targetCorpus > 0
      ? (totalRetirement / draft.retirement.targetCorpus) * 100
      : 0;

  const policies = draft.insurance.policies;
  const totalDeathBenefit = policies.reduce((s, p) => s + p.deathBenefit, 0);
  const totalCICoverage = policies.reduce((s, p) => s + p.ciCoverage, 0);
  const totalSurrenderValue = policies.reduce(
    (s, p) => s + p.surrenderValue,
    0
  );

  return {
    emergency: {
      ...draft.emergency,
      monthsCoverage: Math.round(monthsCoverage * 100) / 100,
      status: emergencyStatus,
    },
    education: {
      ...draft.education,
      progressPercent: Math.round(educationProgress * 100) / 100,
    },
    retirement: {
      ...draft.retirement,
      totalRetirement,
      progressPercent: Math.round(retirementProgress * 100) / 100,
    },
    insurance: {
      totalDeathBenefit,
      totalCICoverage,
      totalSurrenderValue,
      policies,
    },
  };
}

function emptyPolicy(): InsurancePolicy {
  return {
    name: "",
    type: "term",
    deathBenefit: 0,
    ciCoverage: 0,
    surrenderValue: 0,
    annualPremium: 0,
  };
}

export function WealthPillarEditor({
  open,
  onOpenChange,
  data,
  onSave,
}: WealthPillarEditorProps) {
  const [draft, setDraft] = useState<WealthPillarData>(defaultData);

  useEffect(() => {
    if (open) {
      setDraft(data ? structuredClone(data) : defaultData());
    }
  }, [open, data]);

  const updateEmergency = useCallback(
    (field: "balance" | "monthlyExpenses", value: number) => {
      setDraft((prev) => ({
        ...prev,
        emergency: { ...prev.emergency, [field]: value },
      }));
    },
    []
  );

  const updateEducation = useCallback(
    (field: "currentAmount" | "goalAmount" | "targetDate", value: string | number) => {
      setDraft((prev) => ({
        ...prev,
        education: { ...prev.education, [field]: value },
      }));
    },
    []
  );

  const updateRetirement = useCallback(
    (
      field: "gpfValue" | "rmfValue" | "otherRetirement" | "targetCorpus",
      value: number
    ) => {
      setDraft((prev) => ({
        ...prev,
        retirement: { ...prev.retirement, [field]: value },
      }));
    },
    []
  );

  const addPolicy = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      insurance: {
        ...prev.insurance,
        policies: [...prev.insurance.policies, emptyPolicy()],
      },
    }));
  }, []);

  const removePolicy = useCallback((index: number) => {
    setDraft((prev) => ({
      ...prev,
      insurance: {
        ...prev.insurance,
        policies: prev.insurance.policies.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const updatePolicy = useCallback(
    (index: number, field: keyof InsurancePolicy, value: string | number) => {
      setDraft((prev) => ({
        ...prev,
        insurance: {
          ...prev.insurance,
          policies: prev.insurance.policies.map((p, i) =>
            i === index ? { ...p, [field]: value } : p
          ),
        },
      }));
    },
    []
  );

  function handleSave() {
    const final = computeDerived(draft);
    onSave(final);
    onOpenChange(false);
  }

  function numVal(e: React.ChangeEvent<HTMLInputElement>): number {
    const v = parseFloat(e.target.value);
    return Number.isNaN(v) ? 0 : v;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Wealth Pillars</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="emergency" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="retirement">Retirement</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
          </TabsList>

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="space-y-4 pt-4">
            <Input
              label="Balance"
              type="number"
              min={0}
              placeholder="฿ 0"
              value={draft.emergency.balance || ""}
              onChange={(e) => updateEmergency("balance", numVal(e))}
            />
            <Input
              label="Monthly Expenses"
              type="number"
              min={0}
              placeholder="฿ 0"
              value={draft.emergency.monthlyExpenses || ""}
              onChange={(e) => updateEmergency("monthlyExpenses", numVal(e))}
            />
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-4 pt-4">
            <Input
              label="Current Amount"
              type="number"
              min={0}
              placeholder="฿ 0"
              value={draft.education.currentAmount || ""}
              onChange={(e) => updateEducation("currentAmount", numVal(e))}
            />
            <Input
              label="Goal Amount"
              type="number"
              min={0}
              placeholder="฿ 0"
              value={draft.education.goalAmount || ""}
              onChange={(e) => updateEducation("goalAmount", numVal(e))}
            />
            <Input
              label="Target Date"
              type="text"
              placeholder="YYYY-MM-DD"
              value={draft.education.targetDate}
              onChange={(e) => updateEducation("targetDate", e.target.value)}
            />
          </TabsContent>

          {/* Retirement Tab */}
          <TabsContent value="retirement" className="space-y-4 pt-4">
            <Input
              label="GPF Value"
              type="number"
              min={0}
              placeholder="฿ 0"
              value={draft.retirement.gpfValue || ""}
              onChange={(e) => updateRetirement("gpfValue", numVal(e))}
            />
            <Input
              label="RMF Value"
              type="number"
              min={0}
              placeholder="฿ 0"
              value={draft.retirement.rmfValue || ""}
              onChange={(e) => updateRetirement("rmfValue", numVal(e))}
            />
            <Input
              label="Other Retirement"
              type="number"
              min={0}
              placeholder="฿ 0"
              value={draft.retirement.otherRetirement || ""}
              onChange={(e) => updateRetirement("otherRetirement", numVal(e))}
            />
            <Input
              label="Target Corpus"
              type="number"
              min={0}
              placeholder="฿ 0"
              value={draft.retirement.targetCorpus || ""}
              onChange={(e) => updateRetirement("targetCorpus", numVal(e))}
            />
          </TabsContent>

          {/* Insurance Tab */}
          <TabsContent value="insurance" className="space-y-4 pt-4">
            {draft.insurance.policies.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">
                No policies yet. Add one below.
              </p>
            )}

            {draft.insurance.policies.map((policy, index) => (
              <div
                key={index}
                className="rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text">
                    Policy {index + 1}
                  </span>
                  <Button
                    variant="danger"
                    size="sm"
                    type="button"
                    onClick={() => removePolicy(index)}
                  >
                    Remove
                  </Button>
                </div>

                <Input
                  label="Policy Name"
                  type="text"
                  placeholder="e.g. AIA Whole Life"
                  value={policy.name}
                  onChange={(e) =>
                    updatePolicy(index, "name", e.target.value)
                  }
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Type</label>
                  <Select
                    value={policy.type}
                    onValueChange={(val) => updatePolicy(index, "type", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {POLICY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Death Benefit"
                    type="number"
                    min={0}
                    placeholder="฿ 0"
                    value={policy.deathBenefit || ""}
                    onChange={(e) =>
                      updatePolicy(index, "deathBenefit", numVal(e))
                    }
                  />
                  <Input
                    label="CI Coverage"
                    type="number"
                    min={0}
                    placeholder="฿ 0"
                    value={policy.ciCoverage || ""}
                    onChange={(e) =>
                      updatePolicy(index, "ciCoverage", numVal(e))
                    }
                  />
                  <Input
                    label="Surrender Value"
                    type="number"
                    min={0}
                    placeholder="฿ 0"
                    value={policy.surrenderValue || ""}
                    onChange={(e) =>
                      updatePolicy(index, "surrenderValue", numVal(e))
                    }
                  />
                  <Input
                    label="Annual Premium"
                    type="number"
                    min={0}
                    placeholder="฿ 0"
                    value={policy.annualPremium || ""}
                    onChange={(e) =>
                      updatePolicy(index, "annualPremium", numVal(e))
                    }
                  />
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={addPolicy}
              className="w-full"
            >
              + Add Policy
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
