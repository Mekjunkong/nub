"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck } from "lucide-react";

interface TwoFactorSetupProps {
  isEnabled: boolean;
  onEnable: () => Promise<{ qrCodeUrl: string; secret: string }>;
  onVerify: (code: string) => Promise<boolean>;
  onDisable: (password: string) => Promise<boolean>;
}

export function TwoFactorSetup({ isEnabled, onEnable, onVerify, onDisable }: TwoFactorSetupProps) {
  const [step, setStep] = useState<"idle" | "setup" | "verify" | "disable">("idle");
  const [qrUrl, setQrUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEnable() {
    setLoading(true);
    setError("");
    try {
      const result = await onEnable();
      setQrUrl(result.qrCodeUrl);
      setSecret(result.secret);
      setStep("setup");
    } catch { setError("Failed to generate 2FA setup"); }
    setLoading(false);
  }

  async function handleVerify() {
    setLoading(true);
    setError("");
    const ok = await onVerify(code);
    if (ok) { setStep("idle"); }
    else { setError("Invalid code. Try again."); }
    setLoading(false);
  }

  async function handleDisable() {
    setLoading(true);
    setError("");
    const ok = await onDisable(password);
    if (ok) { setStep("idle"); }
    else { setError("Incorrect password."); }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Two-Factor Authentication</CardTitle>
          <Badge variant={isEnabled ? "success" : "default"}>
            {isEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {step === "idle" && !isEnabled && (
          <div className="flex items-center gap-4">
            <Shield className="h-8 w-8 text-text-muted" />
            <div className="flex-1">
              <p className="text-sm text-text">Add an extra layer of security to your account</p>
              <p className="text-xs text-text-muted">Use an authenticator app like Google Authenticator</p>
            </div>
            <Button size="sm" onClick={handleEnable} loading={loading}>Enable 2FA</Button>
          </div>
        )}

        {step === "idle" && isEnabled && (
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-8 w-8 text-success" />
            <div className="flex-1">
              <p className="text-sm text-text">2FA is active on your account</p>
            </div>
            <Button size="sm" variant="danger" onClick={() => setStep("disable")}>Disable</Button>
          </div>
        )}

        {step === "setup" && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-text">Scan this QR code with your authenticator app</p>
            {qrUrl && <img src={qrUrl} alt="2FA QR Code" className="h-48 w-48 rounded-lg border border-border" />}
            <p className="text-xs text-text-muted">Manual key: <code className="font-mono">{secret}</code></p>
            <Button size="sm" onClick={() => setStep("verify")}>Next: Verify Code</Button>
          </div>
        )}

        {step === "verify" && (
          <div className="flex flex-col gap-3">
            <Input label="Enter 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} placeholder="000000" />
            {error && <p className="text-xs text-danger">{error}</p>}
            <Button onClick={handleVerify} loading={loading}>Verify & Enable</Button>
          </div>
        )}

        {step === "disable" && (
          <div className="flex flex-col gap-3">
            <Input label="Confirm your password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-xs text-danger">{error}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep("idle")}>Cancel</Button>
              <Button variant="danger" onClick={handleDisable} loading={loading}>Disable 2FA</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
