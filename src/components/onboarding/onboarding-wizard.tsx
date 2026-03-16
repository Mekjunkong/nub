"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Landmark, Briefcase, Laptop, TrendingUp, PieChart, Receipt } from "lucide-react";
import type { EmploymentType } from "@/types/database";

type Goal = "retirement" | "investing" | "tax";

export function OnboardingWizard() {
  const t = useTranslations("onboarding");
  const tRetirement = useTranslations("retirement");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [employmentType, setEmploymentType] = useState<EmploymentType | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"th" | "en">(locale as "th" | "en");
  const [loading, setLoading] = useState(false);

  const employmentOptions: { value: EmploymentType; label: string; icon: React.ReactNode }[] = [
    { value: "government", label: tRetirement("government"), icon: <Landmark className="h-6 w-6" /> },
    { value: "private", label: tRetirement("private"), icon: <Briefcase className="h-6 w-6" /> },
    { value: "freelance", label: tRetirement("freelance"), icon: <Laptop className="h-6 w-6" /> },
  ];

  const goalOptions: { value: Goal; label: string; icon: React.ReactNode }[] = [
    { value: "retirement", label: t("goalRetirement"), icon: <TrendingUp className="h-6 w-6" /> },
    { value: "investing", label: t("goalInvesting"), icon: <PieChart className="h-6 w-6" /> },
    { value: "tax", label: t("goalTax"), icon: <Receipt className="h-6 w-6" /> },
  ];

  const goalToRoute: Record<Goal, string> = {
    retirement: "calculator/retirement",
    investing: "calculator/mpt",
    tax: "calculator/tax",
  };

  async function handleComplete() {
    if (!employmentType) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("profiles")
        .update({
          employment_type: employmentType,
          language: selectedLanguage,
          onboarding_completed: true,
        })
        .eq("id", user.id);
    }

    const targetRoute = goal ? goalToRoute[goal] : "dashboard";
    router.push(`/${selectedLanguage}/${targetRoute}`);
  }

  const steps = [
    // Step 1: Employment type
    <div key="employment" className="flex flex-col gap-4">
      {employmentOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setEmploymentType(option.value)}
          className={cn(
            "flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
            employmentType === option.value
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:border-border-hover hover:bg-surface-hover"
          )}
        >
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg",
            employmentType === option.value ? "bg-primary/10" : "bg-surface-hover"
          )}>
            {option.icon}
          </div>
          <span className="font-medium">{option.label}</span>
        </button>
      ))}
    </div>,

    // Step 2: Goal
    <div key="goal" className="flex flex-col gap-4">
      {goalOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setGoal(option.value)}
          className={cn(
            "flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
            goal === option.value
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:border-border-hover hover:bg-surface-hover"
          )}
        >
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg",
            goal === option.value ? "bg-primary/10" : "bg-surface-hover"
          )}>
            {option.icon}
          </div>
          <span className="font-medium">{option.label}</span>
        </button>
      ))}
    </div>,

    // Step 3: Language
    <div key="language" className="flex flex-col gap-4">
      {(["th", "en"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setSelectedLanguage(lang)}
          className={cn(
            "flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
            selectedLanguage === lang
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:border-border-hover hover:bg-surface-hover"
          )}
        >
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg text-2xl",
            selectedLanguage === lang ? "bg-primary/10" : "bg-surface-hover"
          )}>
            {lang === "th" ? "TH" : "EN"}
          </div>
          <span className="font-medium">
            {lang === "th" ? "ภาษาไทย" : "English"}
          </span>
        </button>
      ))}
    </div>,
  ];

  const stepTitles = [t("step1Title"), t("step2Title"), t("step3Title")];
  const isLastStep = step === steps.length - 1;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold gradient-text font-heading">
          {t("welcome")}
        </h1>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 rounded-full transition-all",
              index === step ? "w-8 bg-primary" : "w-2 bg-surface-hover"
            )}
          />
        ))}
      </div>

      <h2 className="text-center text-lg font-semibold text-text font-heading">
        {stepTitles[step]}
      </h2>

      {steps[step]}

      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          {locale === "th" ? "กลับ" : "Back"}
        </Button>
        <Button
          onClick={() => {
            if (isLastStep) {
              handleComplete();
            } else {
              setStep((s) => s + 1);
            }
          }}
          loading={loading}
          disabled={step === 0 && !employmentType}
        >
          {isLastStep ? t("finish") : locale === "th" ? "ถัดไป" : "Next"}
        </Button>
      </div>
    </div>
  );
}
