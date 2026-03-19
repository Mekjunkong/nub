"use client";

import type { MptResults } from "@/types/calculator";
import { EfficientFrontierChart } from "@/components/charts/efficient-frontier-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialDisclaimer } from "@/components/calculator/shared/financial-disclaimer";
import { SavePlanButton } from "@/components/calculator/shared/save-plan-button";

interface MptResultsViewProps {
  results: MptResults;
  assetNames: string[];
  inputs?: Record<string, unknown>;
}

export function MptResultsView({ results, assetNames, inputs = {} }: MptResultsViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Max Sharpe Portfolio</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-text-muted">Return: {(results.maxSharpe.expectedReturn * 100).toFixed(2)}%</p>
            <p className="text-sm text-text-muted">Risk: {(results.maxSharpe.risk * 100).toFixed(2)}%</p>
            <p className="text-sm text-text-muted">Sharpe: {results.maxSharpe.sharpeRatio.toFixed(3)}</p>
            <div className="mt-2">
              {results.maxSharpe.weights.map((w, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>{assetNames[i] || `Asset ${i + 1}`}</span>
                  <span className="font-medium">{(w * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Min Volatility Portfolio</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-text-muted">Return: {(results.minVol.expectedReturn * 100).toFixed(2)}%</p>
            <p className="text-sm text-text-muted">Risk: {(results.minVol.risk * 100).toFixed(2)}%</p>
            <p className="text-sm text-text-muted">Sharpe: {results.minVol.sharpeRatio.toFixed(3)}</p>
            <div className="mt-2">
              {results.minVol.weights.map((w, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>{assetNames[i] || `Asset ${i + 1}`}</span>
                  <span className="font-medium">{(w * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Efficient Frontier</CardTitle></CardHeader>
        <CardContent>
          <EfficientFrontierChart
            frontier={results.frontier}
            maxSharpe={results.maxSharpe}
            minVol={results.minVol}
            assetNames={assetNames}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <SavePlanButton planType="mpt" inputs={inputs} results={results as unknown as Record<string, unknown>} />
      </div>
      <FinancialDisclaimer />
    </div>
  );
}
