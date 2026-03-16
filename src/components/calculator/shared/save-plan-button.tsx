"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Save, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavePlanButtonProps {
  onSave: (name: string) => Promise<void>;
  onShare?: () => void;
}

export function SavePlanButton({ onSave, onShare }: SavePlanButtonProps) {
  const locale = useLocale();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const name = prompt(
      locale === "th" ? "ตั้งชื่อแผนของคุณ:" : "Name your plan:"
    );
    if (name) {
      await onSave(name);
      setSaved(true);
    }
    setSaving(false);
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={saved ? "secondary" : "outline"}
        size="sm"
        onClick={handleSave}
        loading={saving}
        disabled={saved}
      >
        <Save className="h-4 w-4" />
        {saved
          ? locale === "th" ? "บันทึกแล้ว" : "Saved"
          : locale === "th" ? "บันทึกแผน" : "Save Plan"}
      </Button>
      {onShare && (
        <Button variant="ghost" size="sm" onClick={onShare}>
          <Share2 className="h-4 w-4" />
          {locale === "th" ? "แชร์" : "Share"}
        </Button>
      )}
    </div>
  );
}
