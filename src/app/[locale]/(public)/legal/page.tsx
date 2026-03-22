import type { Metadata } from "next";

const BASE_URL = "https://nub-six.vercel.app";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "th" ? "ข้อกำหนดทางกฎหมาย | Nub" : "Legal | Nub";
  const description = locale === "th"
    ? "ข้อจำกัดความรับผิดชอบทางการเงิน นโยบายความเป็นส่วนตัว PDPA และข้อตกลงการใช้งาน Nub"
    : "Financial disclaimer, PDPA privacy policy, and terms of service for Nub.";
  return { title, description, alternates: { canonical: `${BASE_URL}/${locale}/legal` }, openGraph: { title, description }, robots: { index: false } };
}

import { setRequestLocale } from "next-intl/server";

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-text font-heading">
        {locale === "th" ? "ข้อกำหนดทางกฎหมาย" : "Legal"}
      </h1>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-text font-heading">
          {locale === "th" ? "ข้อจำกัดความรับผิดชอบทางการเงิน" : "Financial Disclaimer"}
        </h2>
        <div className="prose text-text-secondary text-sm leading-relaxed">
          <p>{locale === "th"
            ? "Nub เป็นเครื่องมือให้ข้อมูลเท่านั้น ไม่ถือเป็นคำแนะนำทางการเงิน การลงทุน หรือภาษี ผลลัพธ์ทั้งหมดเป็นเพียงการประมาณการจากแบบจำลองทางคณิตศาสตร์ ผลตอบแทนในอดีตไม่ได้รับประกันผลตอบแทนในอนาคต กรุณาปรึกษาผู้เชี่ยวชาญทางการเงินที่มีใบอนุญาตก่อนตัดสินใจลงทุน"
            : "Nub is an informational tool only. It does not constitute financial, investment, or tax advice. All results are estimates from mathematical models. Past performance does not guarantee future results. Please consult a licensed financial advisor before making investment decisions."}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-text font-heading">
          {locale === "th" ? "นโยบายความเป็นส่วนตัว (PDPA)" : "Privacy Policy (PDPA)"}
        </h2>
        <div className="prose text-text-secondary text-sm leading-relaxed">
          <p>{locale === "th"
            ? "เราเก็บรวบรวมข้อมูลส่วนบุคคลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ข้อมูลที่เก็บรวบรวมรวมถึง: อีเมล, ชื่อ, ประเภทการจ้างงาน, ข้อมูลที่ป้อนในเครื่องคำนวณ ข้อมูลทั้งหมดเข้ารหัสและจัดเก็บอย่างปลอดภัยบน Supabase"
            : "We collect personal data in accordance with Thailand's Personal Data Protection Act (PDPA). Data collected includes: email, name, employment type, calculator inputs. All data is encrypted and securely stored on Supabase."}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-text font-heading">
          {locale === "th" ? "ข้อตกลงการใช้งาน" : "Terms of Service"}
        </h2>
        <div className="prose text-text-secondary text-sm leading-relaxed">
          <p>{locale === "th"
            ? "การใช้งาน Nub ถือว่าคุณยอมรับข้อตกลงเหล่านี้ ข้อมูลที่นำเสนอไม่ใช่คำแนะนำทางการเงิน ผู้ใช้รับผิดชอบต่อการตัดสินใจทางการเงินของตนเอง"
            : "By using Nub, you agree to these terms. Information presented is not financial advice. Users are responsible for their own financial decisions."}</p>
        </div>
      </section>
    </div>
  );
}
