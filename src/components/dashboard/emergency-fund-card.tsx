"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface EmergencyFundCardProps {
  balance: number;
  monthlyExpenses: number;
}

export function EmergencyFundCard({ balance, monthlyExpenses }: EmergencyFundCardProps) {
  const months = monthlyExpenses > 0 ? balance / monthlyExpenses : 0;
  const status = months >= 6 ? "STRONG" : months >= 3 ? "MODERATE" : "WEAK";
  const statusColor = status === "STRONG" ? "success" : status === "MODERATE" ? "warning" : "danger";

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Emergency Fund</p>
        </div>
        <p className="text-2xl font-bold text-text">{"\u0E3F"}{balance.toLocaleString()}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-text-muted">{months.toFixed(1)} months coverage</span>
          <Badge variant={statusColor}>{status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
