"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";

const features = [
  {
    key: "retirement",
    image: "/images/feature-calculator.webp",
    imageAlt: "Retirement Calculator",
    iconBg: "bg-primary-light",
    iconColor: "text-primary",
    accentColor: "from-primary/8 to-primary/4",
    dotColor: "bg-primary",
  },
  {
    key: "monteCarlo",
    image: "/images/feature-montecarlo.webp",
    imageAlt: "Monte Carlo Simulation",
    iconBg: "bg-success-light",
    iconColor: "text-success",
    accentColor: "from-success/8 to-success/4",
    dotColor: "bg-success",
  },
  {
    key: "portfolio",
    image: "/images/feature-portfolio.webp",
    imageAlt: "Portfolio Optimization",
    iconBg: "bg-secondary-light",
    iconColor: "text-secondary",
    accentColor: "from-secondary/8 to-secondary/4",
    dotColor: "bg-secondary",
  },
  {
    key: "tax",
    image: "/images/feature-tax.webp",
    imageAlt: "Tax Planning",
    iconBg: "bg-warning-light",
    iconColor: "text-warning",
    accentColor: "from-warning/8 to-warning/4",
    dotColor: "bg-warning",
  },
  {
    key: "ai",
    image: "/images/feature-ai.webp",
    imageAlt: "AI Financial Advisor",
    iconBg: "bg-accent-light",
    iconColor: "text-accent",
    accentColor: "from-accent/8 to-accent/4",
    dotColor: "bg-accent",
  },
  {
    key: "community",
    image: "/images/feature-community.webp",
    imageAlt: "Community",
    iconBg: "bg-danger-light",
    iconColor: "text-danger",
    accentColor: "from-danger/8 to-danger/4",
    dotColor: "bg-danger",
  },
];

const stats = [
  { value: "60,000+", label: "Simulations per plan", icon: "📊" },
  { value: "100%", label: "Free forever", icon: "✓" },
  { value: "AFPT™", label: "Certified methodology", icon: "🏅" },
  { value: "2 min", label: "To first insight", icon: "⚡" },
];

export function Features() {
  const t = useTranslations("landing.features");

  return (
    <section className="px-4 py-20 lg:py-28 bg-bg-subtle">
      <div className="mx-auto max-w-6xl">

        {/* Section header */}
        <div className="mb-16 text-center">
          <div className="section-badge mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Platform Features
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text font-heading sm:text-4xl lg:text-5xl">
            {t("sectionTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-text-secondary">
            {t("sectionSubtitle")}
          </p>
        </div>

        {/* Premium stats row */}
        <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card text-center">
              <p className="text-2xl font-bold gradient-text-brand number-highlight">{stat.value}</p>
              <p className="mt-1.5 text-xs font-medium text-text-muted tracking-wide uppercase">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Feature cards grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {features.map((f) => (
            <div key={f.key} className="feature-card-pro group cursor-default p-7">
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.accentColor} opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none`} />

              <div className="relative">
                {/* Icon container — larger and more prominent */}
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${f.iconBg} transition-transform duration-300 group-hover:scale-105 overflow-hidden`}>
                  <Image
                    src={f.image}
                    alt={f.imageAlt}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <h3 className="mb-2.5 text-base font-semibold text-text leading-snug">
                  {t(`${f.key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {t(`${f.key}.description`)}
                </p>

                {/* Bottom accent line on hover */}
                <div className={`mt-5 h-0.5 w-0 rounded-full ${f.dotColor} transition-all duration-300 group-hover:w-8 opacity-60`} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
