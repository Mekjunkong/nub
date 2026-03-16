"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DcaFormProps {
  onCalculate: (values: { monthlyAmount: number; investmentMonths: number; rebalanceFrequency: number }) => void;
}

export function DcaForm({ onCalculate }: DcaFormProps) {
  const [monthlyAmount, setMonthlyAmount] = useState(10000);
  const [investmentYears, setInvestmentYears] = useState(10);
  const [rebalanceFrequency, setRebalanceFrequency] = useState(6);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Monthly DCA Amount (THB)" type="number" value={monthlyAmount} onChange={(e) => setMonthlyAmount(Number(e.target.value))} />
        <Input label="Investment Period (years)" type="number" value={investmentYears} onChange={(e) => setInvestmentYears(Number(e.target.value))} />
      </div>
      <Input label="Rebalance Frequency (months)" type="number" value={rebalanceFrequency} onChange={(e) => setRebalanceFrequency(Number(e.target.value))} />
      <div className="flex justify-end">
        <Button onClick={() => onCalculate({ monthlyAmount, investmentMonths: investmentYears * 12, rebalanceFrequency })}>
          Compare Strategies
        </Button>
      </div>
    </div>
  );
}
