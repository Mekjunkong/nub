"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Step {
  label: string;
  content: ReactNode;
}

interface StepperProps {
  steps: Step[];
  onComplete?: () => void;
  className?: string;
}

export function Stepper({ steps, onComplete, className }: StepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const t = useTranslations("common");

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  function handleNext() {
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                index < currentStep
                  ? "bg-primary text-white"
                  : index === currentStep
                    ? "bg-primary text-white"
                    : "bg-surface-hover text-text-muted"
              )}
            >
              {index < currentStep ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 rounded-full transition-colors",
                  index < currentStep ? "bg-primary" : "bg-surface-hover"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }}
        />
      </div>

      {/* Step label */}
      <h2 className="text-center text-lg font-semibold text-text font-heading">
        {steps[currentStep].label}
      </h2>

      {/* Step content */}
      <div className="min-h-[200px]">{steps[currentStep].content}</div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={isFirstStep}
        >
          {t("back")}
        </Button>
        <Button onClick={handleNext}>
          {isLastStep ? t("submit") : t("next")}
        </Button>
      </div>
    </div>
  );
}
