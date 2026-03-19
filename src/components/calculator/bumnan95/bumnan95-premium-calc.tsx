"use client";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Annuity Premium</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">Gender</p>
            <p className="mt-1 text-lg font-bold text-text capitalize">{gender}</p>
          </div>
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">Annual Premium</p>
            <p className="mt-1 text-lg font-bold text-text">฿{annualPremium.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">Payment Duration</p>
            <p className="mt-1 text-lg font-bold text-text">{paymentDuration} years</p>
          </div>
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">Total Paid</p>
            <p className="mt-1 text-lg font-bold text-text">฿{totalPremiumPaid.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
