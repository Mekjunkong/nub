"use client";

import { useState, useCallback } from "react";
import { runGpfOptimizer } from "@/workers/gpf-optimizer.worker";
import type { GpfOptimizerInputs, GpfOptimizerResults } from "@/types/calculator";

export function useGpfWorker() {
  const [results, setResults] = useState<GpfOptimizerResults | null>(null);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compute = useCallback((inputs: GpfOptimizerInputs) => {
    setComputing(true);
    setError(null);
    try {
      setResults(runGpfOptimizer(inputs));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation failed");
      setResults(null);
    } finally {
      setComputing(false);
    }
  }, []);

  return { results, computing, compute, error };
}
