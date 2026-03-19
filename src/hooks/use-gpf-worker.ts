"use client";

import { useState, useCallback } from "react";
import { runGpfOptimizer } from "@/workers/gpf-optimizer.worker";
import type { GpfOptimizerInputs, GpfOptimizerResults } from "@/types/calculator";

export function useGpfWorker() {
  const [results, setResults] = useState<GpfOptimizerResults | null>(null);
  const [computing, setComputing] = useState(false);

  const compute = useCallback((inputs: GpfOptimizerInputs) => {
    setComputing(true);
    try {
      setResults(runGpfOptimizer(inputs));
    } finally {
      setComputing(false);
    }
  }, []);

  return { results, computing, compute };
}
