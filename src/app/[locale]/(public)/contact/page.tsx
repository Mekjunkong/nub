import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

const BASE_URL = "https://nub-six.vercel.app";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "th" ? "ติดต่อเรา | Nub" : "Contact Us | Nub";
  const description = locale === "th"
    ? "ติดต่อทีม Nub สำหรับคำถามเกี่ยวกับการวางแผนเกษียณ ข้อเสนอแนะ หรือการรายงานปัญหา"
    : "Contact the Nub team for questions about retirement planning, feedback, or issue reports.";
  return { title, description, alternates: { canonical: `${BASE_URL}/${locale}/contact` }, openGraph: { title, description } };
}

export { default } from "./contact-client";
