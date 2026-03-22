"use client";
import { useTranslations } from "next-intl";

const features = [
  {
    key: "retirement",
    emoji: "🧮",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconBg: "bg-primary-light",
    iconColor: "text-primary",
    border: "hover:border-primary/40",
  },
  {
    key: "monteCarlo",
    emoji: "📊",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconBg: "bg-success-light",
    iconColor: "text-success",
    border: "hover:border-success/40",
  },
  {
    key: "portfolio",
    emoji: "🎯",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconBg: "bg-secondary-light",
    iconColor: "text-secondary",
    border: "hover:border-secondary/40",
  },
  {
    key: "tax",
    emoji: "💰",
    gradient: "from-amber-500/10 to-yellow-500/10",
    iconBg: "bg-warning-light",
    iconColor: "text-warning",
    border: "hover:border-warning/40",
  },
  {
    key: "ai",
    emoji: "🤖",
    gradient: "from-sky-500/10 to-blue-500/10",
    iconBg: "bg-accent-light",
    iconColor: "text-accent",
    border: "hover:border-accent/40",
  },
  {
    key: "community",
    emoji: "👥",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconBg: "bg-danger-light",
    iconColor: "text-danger",
    border: "hover:border-danger/40",
  },
];

const stats = [
  { value: "60,000+", label: "Simulations per plan" },
  { value: "100%", label: "Free forever" },
  { value: "AFPT™", label: "Certified methodology" },
  { value: "2 min", label: "To first insight" },
];

export function Features() {
  const t = useTranslations("landing.features");

  return (
    <section className="px-4 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-text-muted shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Everything you need
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text font-heading sm:text-4xl lg:text-5xl">
            {t("sectionTitle") || "Everything You Need"}
            <br />
            <span className="gradient-text">for Retirement Planning</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-text-secondary">
            {t("sectionSubtitle") || "Comprehensive tools powered by quantitative finance"}
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-surface p-5 text-center shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <p className="text-2xl font-bold gradient-text-brand number-highlight">{stat.value}</p>
              <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Feature cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {features.map((f) => (
            <div
              key={f.key}
              className={`card-feature group cursor-default p-6 ${f.border}`}
            >
              {/* Hover gradient background */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

              <div className="relative">
                {/* Icon */}
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${f.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                  <span className="text-xl">{f.emoji}</span>
                </div>

                {/* Content */}
                <h3 className="mb-2 text-base font-semibold text-text">
                  {t(`${f.key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {t(`${f.key}.description`)}
                </p>

                {/* Arrow hint on hover */}
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-text-muted opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                  <span className={f.iconColor}>Learn more</span>
                  <span className={f.iconColor}>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
