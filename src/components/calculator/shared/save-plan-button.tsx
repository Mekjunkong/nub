"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { track, Events } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { PlanType, ScenarioLabel } from "@/types/database";

interface SavePlanButtonProps {
  planType: PlanType;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
}

export function SavePlanButton({ planType, inputs, results }: SavePlanButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [scenario, setScenario] = useState<ScenarioLabel | null>(null);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("saved_plans").insert({
        user_id: user.id,
        plan_type: planType,
        name: name.trim(),
        inputs,
        results,
        is_favorite: false,
        version: 1,
        parent_version_id: null,
        scenario_label: scenario,
      });

      setSaved(true);
      track(Events.PLAN_SAVED, { planType });
      setTimeout(() => {
        setOpen(false);
        setSaved(false);
        setName("");
        setScenario(null);
      }, 1500);
    } catch (e) {
      console.error("Failed to save plan:", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Save className="mr-2 h-4 w-4" />
        Save Plan
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Plan</DialogTitle>
          </DialogHeader>
          <Input
            label="Plan Name"
            placeholder="e.g., My Retirement Plan 2024"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Scenario (optional)</label>
            <div className="flex gap-2">
              {([null, "optimistic", "base", "conservative"] as const).map((s) => (
                <button
                  key={s ?? "none"}
                  type="button"
                  onClick={() => setScenario(s)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    scenario === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-text-muted hover:bg-surface-hover"
                  )}
                >
                  {s === null ? "None" : s === "optimistic" ? "Optimistic" : s === "base" ? "Base" : "Conservative"}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving} disabled={!name.trim()}>
              {saved ? "Saved!" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
