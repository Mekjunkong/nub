"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Bumnan95PremiumCalcProps {
  gender: "male" | "female";
  annualPremium: number;
  paymentDuration: number;
  totalPremiumPaid: number;
}

export function Bumnan95PremiumCalc({
  gender,
  annualPremium,
  paymentDuration,
  totalPremiumPaid,
}: Bumnan95PremiumCalcProps) {
  const t = useTranslations("calculator");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("bumnan95.premiumCalc")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">{t("bumnan95.gender")}</p>
            <p className="mt-1 text-lg font-bold text-text">{t(`bumnan95.${gender}`)}</p>
          </div>
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">{t("bumnan95.annualPremium")}</p>
            <p className="mt-1 text-lg font-bold text-text">฿{annualPremium.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">{t("bumnan95.paymentDuration")}</p>
            <p className="mt-1 text-lg font-bold text-text">{paymentDuration} {t("bumnan95.years")}</p>
          </div>
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">{t("bumnan95.totalPaid")}</p>
            <p className="mt-1 text-lg font-bold text-text">฿{totalPremiumPaid.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
