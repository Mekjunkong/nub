"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { TippInputs } from "@/types/calculator";

interface TippFormProps {
  onSimulate: (inputs: TippInputs) => void;
  computing: boolean;
}

const DEFAULT_ASSETS = [
  {
    name: "SCBRMS&P500",
    monthlyReturns: Array.from(
      { length: 120 },
      (_, i) => 0.005 + 0.02 * Math.sin(i / 6)
    ),
  },
  {
    name: "SCBRMGOLDH",
    monthlyReturns: Array.from(
      { length: 120 },
      (_, i) => 0.003 + 0.015 * Math.cos(i / 8)
    ),
  },
];

const DEFAULT_CORRELATION = [
  [1, 0.25],
  [0.25, 1],
];

export function TippForm({ onSimulate, computing }: TippFormProps) {
  const [initialCapital, setInitialCapital] = useState(1_000_000);
  const [floorPct, setFloorPct] = useState(85);
  const [maxMultiplier, setMaxMultiplier] = useState(5);
  const [targetVolatility, setTargetVolatility] = useState(14);
  const [simulationMonths, setSimulationMonths] = useState(120);

  function handleSubmit() {
    const inputs: TippInputs = {
      initialCapital,
      floorPercentage: floorPct / 100,
      maxMultiplier,
      riskFreeRate: 0.002,
      assets: DEFAULT_ASSETS,
      correlationMatrix: DEFAULT_CORRELATION,
      targetVolatility: targetVolatility / 100,
      rebalanceThreshold: 0.05,
      simulationMonths,
    };
    onSimulate(inputs);
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Initial Capital (THB)"
        type="number"
        value={initialCapital}
        onChange={(e) => setInitialCapital(Number(e.target.value))}
      />
      <Slider
        label="Floor Protection"
        min={70}
        max={95}
        step={1}
        value={floorPct}
        onChange={(e) => setFloorPct(Number(e.currentTarget.value))}
        formatValue={(v) => `${v}%`}
      />
      <Slider
        label="Max Multiplier"
        min={2}
        max={10}
        step={1}
        value={maxMultiplier}
        onChange={(e) => setMaxMultiplier(Number(e.currentTarget.value))}
        formatValue={(v) => `${v}x`}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Target Volatility (%)"
          type="number"
          value={targetVolatility}
          onChange={(e) => setTargetVolatility(Number(e.target.value))}
        />
        <Input
          label="Simulation Months"
          type="number"
          value={simulationMonths}
          onChange={(e) => setSimulationMonths(Number(e.target.value))}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSubmit} loading={computing}>
          Run Simulation
        </Button>
      </div>
    </div>
  );
}
