"use client";

import { useTranslations } from "next-intl";

const features = [
  { key: "retirement", emoji: "🧮", color: "bg-primary/10" },
  { key: "monteCarlo", emoji: "📊", color: "bg-success/10" },
  { key: "portfolio", emoji: "🎯", color: "bg-secondary/10" },
  { key: "tax", emoji: "💰", color: "bg-warning/10" },
  { key: "ai", emoji: "🤖", color: "bg-primary/10" },
  { key: "community", emoji: "👥", color: "bg-success/10" },
];

export function Features() {
  const t = useTranslations("landing.features");

  return (
    <section className="px-4 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-text font-heading sm:text-3xl">
            {t("sectionTitle") || "Everything You Need for Retirement Planning"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-text-muted">
            {t("sectionSubtitle") || "Comprehensive tools powered by quantitative finance"}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.key}
              className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:border-primary/20 hover:bg-surface-hover"
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${f.color}`}>
                <span className="text-lg">{f.emoji}</span>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-text">
                {t(`${f.key}.title`)}
              </h3>
              <p className="text-xs leading-relaxed text-text-muted">
                {t(`${f.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
