"use client";

import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-text font-heading sm:text-3xl">
          {locale === "th" ? "พร้อมวางแผนเกษียณแล้วหรือยัง?" : "Ready to Plan Your Retirement?"}
        </h2>
        <p className="mt-4 text-text-muted">
          {locale === "th"
            ? "เริ่มต้นฟรี ไม่ต้องใช้บัตรเครดิต"
            : "Start for free. No credit card required."}
        </p>
        <div className="mt-8">
          <a href={`/${locale}/login`}>
            <Button size="lg" className="px-12">
              {t("cta")}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
