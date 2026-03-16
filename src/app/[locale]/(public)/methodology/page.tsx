import { setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MethodologyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sections = [
    { title: "Retirement Gap Analysis", formula: "Gap = Required Corpus - Projected Savings", description: "Required corpus is the present value of all future inflation-adjusted expenses from retirement to life expectancy. Projected savings compound current savings with expected returns plus future contributions." },
    { title: "Monte Carlo Simulation", formula: "r_t = E(R) + SD * Z, where Z ~ N(0,1)", description: "We run 60,000 simulations using Geometric Brownian Motion. Each simulation generates random monthly returns and tracks portfolio balance after withdrawals. Survival rate = simulations where balance stays positive / total simulations." },
    { title: "Financial Health Score", formula: "Score = min(100, fundedRatio * 60 + bonuses)", description: "fundedRatio = projected savings / required corpus (capped at 1.5). Bonuses: +10 diversification, +10 savings rate >= 15%, +10 time horizon >= 15 years, +10 insurance coverage." },
    { title: "Modern Portfolio Theory", formula: "Sharpe = (R_p - R_f) / SD_p", description: "We generate the efficient frontier by evaluating thousands of portfolios with non-negative weight constraints. Max Sharpe and Min Volatility portfolios are identified along the frontier." },
    { title: "Thai Tax Brackets (2567)", formula: "Progressive rates: 0%, 5%, 10%, 15%, 20%, 25%, 30%, 35%", description: "Applied to taxable income after deductions. SSF max: min(30% income, 200K). RMF max: min(30% income, 500K). Combined retirement cap: 500K." },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-text font-heading">
        {locale === "th" ? "วิธีการคำนวณ" : "Methodology"}
      </h1>
      <p className="mb-8 text-text-muted">
        {locale === "th" ? "รายละเอียดสูตรและวิธีการคำนวณทั้งหมดที่ใช้ใน Nub" : "Detailed formulas and calculation methods used in Nub"}
      </p>
      <div className="flex flex-col gap-6">
        {sections.map((s) => (
          <Card key={s.title}>
            <CardHeader><CardTitle>{s.title}</CardTitle></CardHeader>
            <CardContent>
              <code className="block mb-3 rounded-lg bg-surface-hover p-3 font-mono text-sm text-primary">{s.formula}</code>
              <p className="text-sm text-text-secondary leading-relaxed">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
