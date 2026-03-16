import { setRequestLocale } from "next-intl/server";
import { PublicLayout } from "@/components/layout/public-layout";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { CtaSection } from "@/components/landing/cta-section";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PublicLayout>
      <Hero />
      <Features />
      <CtaSection />
    </PublicLayout>
  );
}
