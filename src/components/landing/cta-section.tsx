"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-primary/[0.15] bg-gradient-to-br from-primary/[0.08] to-secondary/[0.08] p-10 text-center sm:p-14">
          <h2 className="text-2xl font-bold text-text font-heading sm:text-3xl">
            {locale === "th" ? "พร้อมวางแผนเกษียณแล้วหรือยัง?" : "Ready to Plan Your Retirement?"}
          </h2>
          <p className="mt-3 text-sm text-text-muted">
            {locale === "th"
              ? "เริ่มต้นฟรี ไม่ต้องใช้บัตรเครดิต"
              : "Start for free. No credit card required."}
          </p>
          <div className="mt-8">
            <Link href={`/${locale}/login`}>
              <Button size="lg" className="px-12 shadow-lg shadow-primary/25">
                {t("cta")} →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
