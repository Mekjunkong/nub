"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmploymentSelector } from "@/components/calculator/retirement/employment-selector";
import type { EmploymentType } from "@/types/database";

interface ProfileFormProps {
  initialValues: {
    displayName: string;
    avatarUrl: string;
    employmentType: EmploymentType | null;
  };
  onSave: (values: { displayName: string; employmentType: EmploymentType | null }) => Promise<void>;
}

export function ProfileForm({ initialValues, onSave }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialValues.displayName);
  const [employmentType, setEmploymentType] = useState<EmploymentType | null>(initialValues.employmentType);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({ displayName, employmentType });
    setSaving(false);
  }

  return (
    <Card>
      <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <div>
            <p className="mb-2 text-sm font-medium text-text">Employment Type</p>
            <EmploymentSelector selected={employmentType} onSelect={setEmploymentType} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>Save Profile</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
