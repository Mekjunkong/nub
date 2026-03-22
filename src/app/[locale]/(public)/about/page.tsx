import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "th" ? "เกี่ยวกับ Nub - แพลตฟอร์มวางแผนเกษียณ" : "About Nub - Retirement Planning Platform";
  const description = locale === "th"
    ? "Nub เป็นแพลตฟอร์มวางแผนเกษียณที่ครบครันสำหรับคนไทย พัฒนาด้วย Monte Carlo Simulation และ Modern Portfolio Theory"
    : "Nub is a comprehensive retirement planning platform for Thai people, powered by Monte Carlo Simulation and Modern Portfolio Theory.";
  return { title, description, openGraph: { title, description } };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isth = locale === "th";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="mb-4 text-4xl font-bold gradient-text font-heading">
          {isth ? "เกี่ยวกับ Nub" : "About Nub"}
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          {isth
            ? "แพลตฟอร์มวางแผนเกษียณที่ครบครันที่สุดสำหรับคนไทย พัฒนาด้วยเทคโนโลยีระดับโลก เพื่อให้ทุกคนสามารถวางแผนการเงินได้อย่างมั่นใจ"
            : "The most comprehensive retirement planning platform for Thai people, built with world-class technology to help everyone plan their financial future with confidence."}
        </p>
      </div>

      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-16 shadow-xl">
        <Image 
          src="/images/about-hero.webp" 
          alt="Nub Financial Planning" 
          fill 
          className="object-cover"
          priority
        />
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-text font-heading mb-4">
            {isth ? "วิสัยทัศน์ของเรา" : "Our Vision"}
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            {isth
              ? "เราเชื่อว่าคนไทยทุกคนควรเข้าถึงเครื่องมือวางแผนการเงินที่มีคุณภาพสูงได้ฟรี โดยไม่ต้องมีความรู้ทางการเงินที่ซับซ้อน Nub ถูกสร้างขึ้นมาเพื่อลดช่องว่างนี้"
              : "We believe every Thai person should have free access to high-quality financial planning tools, without needing complex financial knowledge. Nub was built to bridge this gap."}
          </p>
          <p className="text-text-secondary leading-relaxed">
            {isth
              ? "ด้วยการนำเทคโนโลยีอย่าง Monte Carlo Simulation และ Modern Portfolio Theory มาทำให้ใช้งานง่าย เราหวังว่าจะช่วยให้คนไทยหลายล้านคนเกษียณได้อย่างมีความสุขและไร้กังวล"
              : "By making technologies like Monte Carlo Simulation and Modern Portfolio Theory easy to use, we hope to help millions of Thais retire happily and worry-free."}
          </p>
        </div>
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-primary mb-2">{isth ? "ความแม่นยำ" : "Accuracy"}</h3>
              <p className="text-sm text-text-secondary">
                {isth ? "จำลองสถานการณ์กว่า 60,000 รูปแบบเพื่อผลลัพธ์ที่เชื่อถือได้" : "Simulating over 60,000 scenarios for reliable results."}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-success mb-2">{isth ? "ความเป็นส่วนตัว" : "Privacy"}</h3>
              <p className="text-sm text-text-secondary">
                {isth ? "ข้อมูลของคุณถูกเข้ารหัสและเก็บรักษาอย่างปลอดภัยสูงสุด" : "Your data is encrypted and kept with the highest security."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-text font-heading mb-6 text-center">
        {isth ? "ทีมผู้ก่อตั้ง" : "Founding Team"}
      </h2>
      <Card className="mb-12 max-w-2xl mx-auto overflow-hidden">
        <CardContent className="p-0 sm:flex">
          <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-surface-hover">
            <Image 
              src="/images/founder-avatar.webp" 
              alt="Dr. Nub" 
              fill 
              className="object-cover"
            />
          </div>
          <div className="p-6 sm:p-8 flex-1">
            <p className="font-bold text-xl text-text mb-1">Dr. Nub</p>
            <p className="text-primary font-medium text-sm mb-3">
              {isth ? "ผู้ก่อตั้ง & ที่ปรึกษาการเงิน" : "Founder & Financial Advisor"}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="primary">AFPT No. 250238</Badge>
              <Badge variant="secondary">IC License No. 136911</Badge>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {isth
                ? "ที่ปรึกษาการเงินอิสระ (AFPT) ผู้เชี่ยวชาญด้านการวางแผนเกษียณและการลงทุน มีประสบการณ์ให้คำปรึกษาลูกค้ากว่า 500 ครอบครัว และเป็นวิทยากรด้านการเงิน"
                : "Associate Financial Planner Thailand (AFPT), specializing in retirement planning and investment. Experienced in advising over 500 families and a regular financial speaker."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-text-muted text-sm border-t border-border pt-8">
        <p>{isth ? "พัฒนาด้วยใจรัก เพื่อคนไทยทุกคน 🇹🇭" : "Built with care, for every Thai 🇹🇭"}</p>
      </div>
    </div>
  );
}
