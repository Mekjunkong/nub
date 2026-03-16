"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { DarkModeToggle } from "@/components/layout/dark-mode-toggle";

interface PreferencesFormProps {
  notificationsEnabled: boolean;
  onNotificationsChange: (enabled: boolean) => void;
}

export function PreferencesForm({ notificationsEnabled, onNotificationsChange }: PreferencesFormProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text">Language</p>
            <p className="text-xs text-text-muted">Choose your preferred language</p>
          </div>
          <LanguageToggle />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text">Dark Mode</p>
            <p className="text-xs text-text-muted">Toggle dark theme</p>
          </div>
          <DarkModeToggle />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text">Notifications</p>
            <p className="text-xs text-text-muted">Receive email notifications</p>
          </div>
          <Switch checked={notificationsEnabled} onCheckedChange={onNotificationsChange} />
        </div>
      </CardContent>
    </Card>
  );
}
