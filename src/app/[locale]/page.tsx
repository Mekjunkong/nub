import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PublicLayout } from "@/components/layout/public-layout";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { CtaSection } from "@/components/landing/cta-section";

const BASE_URL = "https://nub-six.vercel.app";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isth = locale === "th";
  const title = isth ? "Nub - วางแผนเกษียณอย่างมั่นใจ" : "Nub - Plan Your Retirement with Confidence";
  const description = isth
    ? "เครื่องมือวางแผนเกษียณฟรี ด้วย Monte Carlo Simulation 60,000 สถานการณ์ คำนวณ Financial Health Score วิเคราะห์พอร์ต และวางแผนภาษี SSF RMF"
    : "Free retirement planning with Monte Carlo Simulation, Financial Health Score, portfolio analysis, and Thai tax optimization (SSF, RMF, GPF).";
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/${locale}` },
    openGraph: {
      title, description,
      url: `${BASE_URL}/${locale}`,
      images: [{ url: `${BASE_URL}/og-default.jpg`, width: 1200, height: 630 }],
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
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
