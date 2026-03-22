"use client";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Shield, Zap, Award } from "lucide-react";
import Image from "next/image";

export function Hero() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.2;

  return (
    <section className="relative min-h-[90vh] overflow-hidden flex items-center px-4 py-16 sm:py-20 lg:py-0">
      {/* Background: subtle radial gradient + grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Soft blobs */}
      <div
        className="hero-blob w-[700px] h-[700px] bg-primary/12 -top-48 -right-48"
        style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
      />
      <div
        className="hero-blob w-[500px] h-[500px] bg-secondary/10 -bottom-48 -left-24 animate-blob"
        style={{ transform: `translateY(${-parallaxOffset * 0.3}px)` }}
      />

      <div className="relative mx-auto max-w-7xl w-full">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">

          {/* Left: Text Content */}
          <div
            className="flex-1 text-center lg:text-left animate-slide-up"
            style={{ transform: `translateY(${-parallaxOffset * 0.06}px)` }}
          >
            {/* Eyebrow badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-light px-4 py-2 text-xs font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {locale === "th" ? "แพลตฟอร์มวางแผนเกษียณฟรี" : "Free Retirement Planning Platform"}
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight font-heading sm:text-5xl lg:text-6xl xl:text-[4.5rem]">
              <span className="block text-text">
                {locale === "th" ? "วางแผนเกษียณ" : "Plan Your Retirement"}
              </span>
              <span className="block mt-2 gradient-text-brand">
                {locale === "th" ? "อย่างมั่นใจ" : "With Confidence"}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-secondary lg:mx-0 lg:text-lg">
              {t("heroSubtitle")}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link href={`/${locale}/login`}>
                <Button
                  size="lg"
                  className="group px-8 gap-2 text-sm font-semibold"
                  style={{ boxShadow: "var(--shadow-primary)" }}
                >
                  {t("cta")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href={`/${locale}/methodology`}>
                <Button variant="outline" size="lg" className="group gap-1 text-sm font-medium">
                  {locale === "th" ? "ดูวิธีการคำนวณ" : "See Methodology"}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5 border-t border-border/60 pt-8 lg:justify-start">
              <TrustBadge
                icon={<Zap className="h-3.5 w-3.5" />}
                color="text-success bg-success-light"
                label={locale === "th" ? "ฟรี 100%" : "100% Free"}
              />
              <TrustBadge
                icon={<Award className="h-3.5 w-3.5" />}
                color="text-primary bg-primary-light"
                label="AFPT™ Certified"
              />
              <TrustBadge
                icon={<Shield className="h-3.5 w-3.5" />}
                color="text-warning bg-warning-light"
                label={locale === "th" ? "ข้อมูลปลอดภัย PDPA" : "PDPA Compliant"}
              />
            </div>
          </div>

          {/* Right: Glass Dashboard Card */}
          <div
            className="w-full max-w-[380px] flex-shrink-0 lg:max-w-[400px] animate-slide-in-right"
            style={{ transform: `translateY(${-parallaxOffset * 0.1}px)` }}
          >
            {/* Floating illustration above the card */}
            <div className="relative mb-[-36px] flex justify-center z-10">
              <div className="relative h-[160px] w-[260px] sm:h-[180px] sm:w-[300px]">
                <Image
                  src="/images/hero-couple.webp"
                  alt="Couple planning retirement"
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>
            <GlassDashboardCard />
          </div>

        </div>
      </div>
    </section>
  );
}

function TrustBadge({ icon, color, label }: { icon: React.ReactNode; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex items-center justify-center rounded-full p-1.5 ${color}`}>{icon}</span>
      <span className="text-sm font-medium text-text-secondary">{label}</span>
    </div>
  );
}

function GlassDashboardCard() {
  return (
    <div className="relative">
      {/* Glow behind card */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/15 to-secondary/15 blur-2xl scale-95 opacity-70" />
      <div className="relative rounded-3xl border border-border/50 bg-surface/95 p-6 shadow-2xl backdrop-blur-xl">

        {/* Card header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Financial Health Score</p>
          <span className="rounded-full bg-success-light px-2.5 py-1 text-[10px] font-bold text-success">↑ +3 pts</span>
        </div>

        {/* Score ring + stats */}
        <div className="mb-4 flex items-center gap-5">
          <div className="relative h-[88px] w-[88px] flex-shrink-0">
            <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
              <circle cx="44" cy="44" r="36" fill="none" stroke="currentColor" strokeWidth="5" className="text-bg-subtle" />
              <circle
                cx="44" cy="44" r="36"
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="5"
                strokeDasharray="226"
                strokeDashoffset="63"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4361EE" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-text number-highlight">72</span>
              <span className="text-[9px] font-bold text-success uppercase tracking-wide">Good</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <StatRow label="Survival Rate" value="87%" color="text-success" />
            <StatRow label="Retirement Gap" value="-5.2M" color="text-danger" />
            <StatRow label="Simulations" value="60,000" color="text-primary" />
          </div>
        </div>

        {/* Mini chart */}
        <div className="rounded-xl bg-bg-subtle p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-text-muted">Wealth Projection</span>
            <span className="text-[10px] font-bold text-primary">Monte Carlo</span>
          </div>
          <svg width="100%" height="48" viewBox="0 0 320 48" preserveAspectRatio="none" className="overflow-visible">
            <path
              d="M0,36 Q80,24 160,14 Q240,8 320,2 L320,12 Q240,18 160,24 Q80,32 0,42 Z"
              fill="rgba(67,97,238,0.07)"
            />
            <path
              d="M0,38 Q80,28 160,18 Q240,10 320,4"
              fill="none"
              stroke="url(#chartGrad2)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M0,42 Q80,38 160,34 Q240,30 320,24"
              fill="none"
              stroke="rgba(239,68,68,0.25)"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <defs>
              <linearGradient id="chartGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4361EE" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="mt-1.5 flex justify-between">
            <span className="text-[9px] text-text-muted">Today</span>
            <span className="text-[9px] text-text-muted">Retirement</span>
            <span className="text-[9px] text-text-muted">Life Exp.</span>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[10px] text-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Live simulation preview
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-text-muted">{label}</span>
      <span className={`text-xs font-bold number-highlight ${color}`}>{value}</span>
    </div>
  );
}
