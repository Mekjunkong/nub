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
import type { PlanType } from "@/types/database";

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
      });

      setSaved(true);
      track(Events.PLAN_SAVED, { planType });
      setTimeout(() => {
        setOpen(false);
        setSaved(false);
        setName("");
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
