"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SocialAuthButtons } from "./social-auth-buttons";

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/dashboard`);
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(
        locale === "th" ? "รหัสผ่านไม่ตรงกัน" : "Passwords do not match"
      );
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/onboarding`);
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <SocialAuthButtons />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface px-2 text-text-muted">
            {t("orContinueWith")}
          </span>
        </div>
      </div>

      <Tabs defaultValue="login">
        <TabsList className="w-full">
          <TabsTrigger value="login" className="flex-1">
            {t("loginTitle")}
          </TabsTrigger>
          <TabsTrigger value="register" className="flex-1">
            {t("registerTitle")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              name="email"
              type="email"
              label={t("email")}
              required
              autoComplete="email"
            />
            <Input
              name="password"
              type="password"
              label={t("password")}
              required
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              {t("loginTitle")}
            </Button>
            <a
              href="#"
              className="text-center text-sm text-primary hover:underline"
            >
              {t("forgotPassword")}
            </a>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <Input
              name="email"
              type="email"
              label={t("email")}
              required
              autoComplete="email"
            />
            <Input
              name="password"
              type="password"
              label={t("password")}
              required
              autoComplete="new-password"
            />
            <Input
              name="confirmPassword"
              type="password"
              label={t("confirmPassword")}
              required
              autoComplete="new-password"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              {t("registerTitle")}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
