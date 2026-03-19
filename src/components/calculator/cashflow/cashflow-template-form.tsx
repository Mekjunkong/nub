"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CashflowDirection, CashflowCategory } from "@/types/database";

interface Template {
  id: string;
  name: string;
  direction: CashflowDirection;
  category: CashflowCategory;
  amount: number;
  isActive: boolean;
}

interface CashflowTemplateFormProps {
  templates: Template[];
  onAdd: (t: Omit<Template, "id" | "isActive">) => void;
  onUpdate?: (id: string, t: Partial<Template>) => void;
  onDelete: (id: string) => void;
}

const DIRECTION_LABELS: Record<CashflowDirection, string> = {
  income: "Income",
  expense: "Expense",
  saving: "Saving",
  investment: "Investment",
};

const DIRECTION_BADGE_VARIANT: Record<CashflowDirection, "success" | "danger" | "primary" | "secondary"> = {
  income: "success",
  expense: "danger",
  saving: "primary",
  investment: "secondary",
};

const CATEGORIES_BY_DIRECTION: Record<CashflowDirection, CashflowCategory[]> = {
  income: ["salary", "overtime", "bonus", "allowance"],
  expense: [
    "personal", "family", "transport", "education",
    "travel", "housing", "debt", "donation", "other",
  ],
  saving: [
    "insurance_life", "insurance_health", "insurance_pension",
    "rmf", "ssf", "pvd", "gpf", "tesg",
  ],
  investment: [
    "insurance_life", "insurance_health", "insurance_pension",
    "rmf", "ssf", "pvd", "gpf", "tesg",
  ],
};

const CATEGORY_LABELS: Record<CashflowCategory, string> = {
  salary: "Salary",
  overtime: "Overtime",
  bonus: "Bonus",
  allowance: "Allowance",
  personal: "Personal",
  family: "Family",
  transport: "Transport",
  education: "Education",
  travel: "Travel",
  housing: "Housing",
  debt: "Debt",
  donation: "Donation",
  other: "Other",
  insurance_life: "Life Insurance",
  insurance_health: "Health Insurance",
  insurance_pension: "Pension Insurance",
  rmf: "RMF",
  ssf: "SSF",
  pvd: "PVD",
  gpf: "GPF",
  tesg: "TESG",
};

export function CashflowTemplateForm({
  templates,
  onAdd,
  onUpdate,
  onDelete,
}: CashflowTemplateFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [direction, setDirection] = useState<CashflowDirection>("income");
  const [category, setCategory] = useState<CashflowCategory>("salary");
  const [amount, setAmount] = useState("");

  function resetForm() {
    setName("");
    setDirection("income");
    setCategory("salary");
    setAmount("");
    setShowForm(false);
    setEditingId(null);
  }

  function handleDirectionChange(value: CashflowDirection) {
    setDirection(value);
    const cats = CATEGORIES_BY_DIRECTION[value];
    setCategory(cats[0]);
  }

  function handleSave() {
    const parsed = parseFloat(amount);
    if (!name.trim() || isNaN(parsed) || parsed <= 0) return;

    if (editingId && onUpdate) {
      onUpdate(editingId, { name: name.trim(), direction, category, amount: parsed });
    } else {
      onAdd({ name: name.trim(), direction, category, amount: parsed });
    }
    resetForm();
  }

  function handleEdit(template: Template) {
    setEditingId(template.id);
    setName(template.name);
    setDirection(template.direction);
    setCategory(template.category);
    setAmount(String(template.amount));
    setShowForm(true);
  }

  const availableCategories = CATEGORIES_BY_DIRECTION[direction];

  return (
    <div data-testid="cashflow-templates">
      <Card>
        <CardHeader>
          <CardTitle>Recurring Items</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Existing templates table */}
          {templates.length > 0 && (
            <div className="mb-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-muted">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 text-right font-medium">Amount</th>
                    <th className="pb-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0">
                      <td className="py-2 text-text">{t.name}</td>
                      <td className="py-2">
                        <Badge variant={DIRECTION_BADGE_VARIANT[t.direction]}>
                          {DIRECTION_LABELS[t.direction]}
                        </Badge>
                      </td>
                      <td className="py-2 text-text-muted">
                        {CATEGORY_LABELS[t.category]}
                      </td>
                      <td className="py-2 text-right text-text">
                        {"\u0E3F"}{t.amount.toLocaleString()}
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(t)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(t.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Inline add/edit form */}
          {showForm && (
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Monthly Salary"
                />
                <Input
                  label="Amount (THB)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Type</label>
                  <Select value={direction} onValueChange={(v) => handleDirectionChange(v as CashflowDirection)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="saving">Saving</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Category</label>
                  <Select value={category} onValueChange={(v) => setCategory(v as CashflowCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  {editingId ? "Update" : "Save"}
                </Button>
              </div>
            </div>
          )}

          {!showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              Add Recurring Item
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
