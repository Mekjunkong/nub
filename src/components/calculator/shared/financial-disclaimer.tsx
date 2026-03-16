"use client";

import { useLocale } from "next-intl";

export function FinancialDisclaimer() {
  const locale = useLocale();
  return (
    <div className="mt-6 rounded-xl border border-warning/30 bg-warning/5 p-4 text-xs text-text-muted">
      <p className="font-semibold text-warning">
        {locale === "th" ? "ข้อจำกัดความรับผิดชอบ" : "Disclaimer"}
      </p>
      <p className="mt-1">
        {locale === "th"
          ? "ผลลัพธ์จากการคำนวณเป็นเพียงการประมาณการเท่านั้น ไม่ถือเป็นคำแนะนำทางการเงิน กรุณาปรึกษาผู้เชี่ยวชาญทางการเงินก่อนตัดสินใจลงทุน ผลตอบแทนในอดีตไม่ได้รับประกันผลตอบแทนในอนาคต"
          : "Results are estimates only and do not constitute financial advice. Please consult a qualified financial advisor before making investment decisions. Past performance does not guarantee future results."}
      </p>
    </div>
  );
}
