"use client";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "No credit card required",
  "60,000 Monte Carlo simulations",
  "AFPT™ certified methodology",
  "Available in Thai & English",
];

export function CtaSection() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <section className="px-4 py-20 lg:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Gradient background */}
          <div className="absolute inset-0 gradient-brand opacity-90" />

          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Content */}
          <div className="relative px-8 py-14 text-center sm:px-14 sm:py-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              {locale === "th" ? "เริ่มต้นวันนี้" : "Start today — it's free"}
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white font-heading sm:text-4xl lg:text-5xl">
              {locale === "th" ? "พร้อมวางแผนเกษียณ" : "Ready to Plan Your"}
              <br />
              {locale === "th" ? "แล้วหรือยัง?" : "Retirement?"}
            </h2>

            <p className="mx-auto mt-4 max-w-md text-base text-white/75">
              {locale === "th"
                ? "เริ่มต้นฟรี ไม่ต้องใช้บัตรเครดิต ใช้งานได้ทันที"
                : "Start for free. No credit card required. Get your first insight in minutes."}
            </p>

            {/* Benefits list */}
            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-1.5 text-sm text-white/80">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white/60" />
                  {b}
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href={`/${locale}/login`}>
                <Button
                  size="lg"
                  className="group gap-2 bg-white text-primary hover:bg-white/90 px-10 text-base font-semibold shadow-xl"
                >
                  {t("cta")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href={`/${locale}/about`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-base"
                >
                  {locale === "th" ? "เรียนรู้เพิ่มเติม" : "Learn More"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
