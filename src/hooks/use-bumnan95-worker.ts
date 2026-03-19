"use client";

import { useState, useCallback } from "react";
import { runBumnan95 } from "@/workers/bumnan95.worker";
import type { Bumnan95Inputs, Bumnan95Results } from "@/types/calculator";

export function useBumnan95Worker() {
  const [results, setResults] = useState<Bumnan95Results | null>(null);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compute = useCallback((inputs: Bumnan95Inputs) => {
    setComputing(true);
    setError(null);
    try {
      setResults(runBumnan95(inputs));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation failed");
      setResults(null);
    } finally {
      setComputing(false);
    }
  }, []);

  return { results, computing, compute, error };
}
