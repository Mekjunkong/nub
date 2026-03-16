"use client";

import { useTranslations } from "next-intl";
import { Calculator, TrendingUp, PieChart, Receipt, MessageCircle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const featureIcons = [Calculator, TrendingUp, PieChart, Receipt, MessageCircle, Users];
const featureKeys = ["retirement", "monteCarlo", "portfolio", "tax", "ai", "community"];
const featureColors = ["text-primary", "text-success", "text-secondary", "text-warning", "text-primary", "text-success"];

export function Features() {
  const t = useTranslations("landing.features");

  return (
    <section className="px-4 py-16 bg-surface">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center text-2xl font-bold text-text font-heading sm:text-3xl">
          Everything You Need for Retirement Planning
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((key, i) => {
            const Icon = featureIcons[i];
            return (
              <Card key={key} className="transition-all hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-surface-hover ${featureColors[i]}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-text">{t(`${key}.title`)}</h3>
                  <p className="text-sm text-text-muted">{t(`${key}.description`)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
