"use client";

import { ProfileForm } from "@/components/profile/profile-form";
import { PreferencesForm } from "@/components/profile/preferences-form";
import { TwoFactorSetup } from "@/components/profile/two-factor-setup";
import { DataExport } from "@/components/profile/data-export";
import { DangerZone } from "@/components/profile/danger-zone";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text font-heading">Profile & Settings</h1>

      <ProfileForm
        initialValues={{ displayName: "", avatarUrl: "", employmentType: null }}
        onSave={async (values) => console.log("Save profile:", values)}
      />

      <PreferencesForm
        notificationsEnabled={true}
        onNotificationsChange={(v) => console.log("Notifications:", v)}
      />

      <TwoFactorSetup
        isEnabled={false}
        onEnable={async () => ({ qrCodeUrl: "", secret: "ABCDEF123456" })}
        onVerify={async (code) => code === "123456"}
        onDisable={async () => true}
      />

      <DataExport />
      <DangerZone />
    </div>
  );
}
