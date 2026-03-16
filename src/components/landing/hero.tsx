"use client";

import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

export function Hero() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden px-4 py-20 sm:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="whitespace-pre-line text-4xl font-bold leading-tight text-text font-heading sm:text-5xl lg:text-6xl">
          <span className="gradient-text">{t("heroTitle")}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
          {t("heroSubtitle")}
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a href={`/${locale}/login`}>
            <Button size="lg" className="px-8">
              {t("cta")}
            </Button>
          </a>
          <a href={`/${locale}/methodology`}>
            <Button variant="outline" size="lg">
              {locale === "th" ? "ดูวิธีการคำนวณ" : "See Methodology"}
            </Button>
          </a>
        </div>
      </div>
      {/* Decorative gradient blobs */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
    </section>
  );
}
