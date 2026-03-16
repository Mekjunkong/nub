import { setRequestLocale } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold gradient-text font-heading">
        {locale === "th" ? "เกี่ยวกับ Nub" : "About Nub"}
      </h1>

      <div className="prose text-text-secondary text-sm leading-relaxed mb-8">
        <p>{locale === "th"
          ? "Nub เป็นแพลตฟอร์มวางแผนเกษียณที่ครบครันสำหรับคนไทย พัฒนาด้วยเทคโนโลยี Monte Carlo Simulation และ Modern Portfolio Theory เพื่อช่วยให้คุณวางแผนการเงินเพื่อการเกษียณอย่างมั่นใจ"
          : "Nub is a comprehensive retirement planning platform for Thai people, powered by Monte Carlo Simulation and Modern Portfolio Theory to help you plan your financial future with confidence."}</p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-text font-heading mb-3">
            {locale === "th" ? "ผู้ก่อตั้ง" : "Founder"}
          </h2>
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">N</div>
            <div>
              <p className="font-semibold text-text">Dr. Nub</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="primary">AFPT No. 250238</Badge>
                <Badge variant="secondary">IC License No. 136911</Badge>
              </div>
              <p className="mt-2 text-sm text-text-muted">
                {locale === "th"
                  ? "ที่ปรึกษาการเงินอิสระ (AFPT) ผู้เชี่ยวชาญด้านการวางแผนเกษียณและการลงทุน"
                  : "Associate Financial Planner Thailand (AFPT), specializing in retirement planning and investment."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-text-muted text-sm">
        <p>{locale === "th" ? "พัฒนาด้วยใจรัก เพื่อคนไทยทุกคน" : "Built with care, for every Thai."}</p>
      </div>
    </div>
  );
}
