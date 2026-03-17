"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-24 lg:py-32">
      {/* Background gradient orbs */}
      <div className="absolute -top-40 right-20 h-[400px] w-[400px] rounded-full bg-primary/[0.08] blur-[100px]" />
      <div className="absolute -bottom-60 -left-20 h-[350px] w-[350px] rounded-full bg-secondary/[0.06] blur-[100px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left: Text Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.08] px-4 py-1.5">
              <span className="text-xs font-medium text-primary">
                🎯 {locale === "th" ? "แพลตฟอร์มวางแผนเกษียณฟรี" : "Free Retirement Planning Platform"}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold leading-tight font-heading sm:text-5xl lg:text-6xl">
              <span className="text-text">{locale === "th" ? "วางแผนเกษียณ" : "Plan Your Retirement"}</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                {locale === "th" ? "อย่างมั่นใจ" : "With Confidence"}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-muted lg:mx-0 lg:text-lg">
              {t("heroSubtitle")}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link href={`/${locale}/login`}>
                <Button size="lg" className="px-8 shadow-lg shadow-primary/25">
                  {t("cta")} →
                </Button>
              </Link>
              <Link href={`/${locale}/methodology`}>
                <Button variant="outline" size="lg">
                  {locale === "th" ? "ดูวิธีการคำนวณ" : "See Methodology"}
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 border-t border-border pt-6 lg:justify-start">
              <TrustBadge color="bg-success" label={locale === "th" ? "ฟรี 100%" : "100% Free"} />
              <TrustBadge color="bg-primary" label="AFPT™ Certified" />
              <TrustBadge color="bg-warning" label={locale === "th" ? "ข้อมูลปลอดภัย PDPA" : "PDPA Compliant"} />
            </div>
          </div>

          {/* Right: Glass Dashboard Card */}
          <div className="w-full max-w-sm flex-shrink-0 lg:max-w-[400px]">
            <GlassDashboardCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBadge({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}

function GlassDashboardCard() {
  return (
    <div className="rounded-3xl border border-border bg-surface/90 p-7 shadow-2xl backdrop-blur-xl">
      {/* Health Score Gauge */}
      <div className="mb-5 text-center">
        <p className="mb-3 text-xs text-text-muted">Financial Health Score</p>
        <div className="relative mx-auto h-[120px] w-[120px]">
          <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-hover" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke="url(#nubScoreGrad)" strokeWidth="8"
              strokeDasharray="235" strokeDashoffset="66"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="nubScoreGrad">
                <stop offset="0%" stopColor="#4F7CF7" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-text">72</span>
            <span className="text-[10px] font-medium text-success">Good</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-4 flex gap-2">
        <StatBox label="Survival Rate" value="87%" valueColor="text-success" />
        <StatBox label="Retirement Gap" value="-5.2M" valueColor="text-danger" />
      </div>

      {/* Mini Wealth Chart */}
      <div className="rounded-xl bg-surface-hover/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] text-text-muted">Wealth Projection</span>
          <span className="text-[10px] text-primary">60,000 simulations</span>
        </div>
        <svg width="100%" height="50" viewBox="0 0 320 50" preserveAspectRatio="none" className="overflow-visible">
          <path d="M0,40 Q80,28 160,18 Q240,12 320,4" fill="none" stroke="rgba(52,211,153,0.15)" strokeWidth="18" />
          <path d="M0,40 Q80,32 160,24 Q240,18 320,10" fill="none" stroke="#4F7CF7" strokeWidth="2" />
          <path d="M0,40 Q80,38 160,36 Q240,34 320,28" fill="none" stroke="rgba(248,113,113,0.3)" strokeWidth="1" strokeDasharray="4,4" />
        </svg>
        <div className="mt-1 flex justify-between">
          <span className="text-[9px] text-text-muted">Today</span>
          <span className="text-[9px] text-text-muted">Retirement</span>
          <span className="text-[9px] text-text-muted">Life Exp</span>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, valueColor }: { label: string; value: string; valueColor: string }) {
  return (
    <div className="flex-1 rounded-xl bg-surface-hover/50 p-3 text-center">
      <p className="text-[10px] text-text-muted">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}
