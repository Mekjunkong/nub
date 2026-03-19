"use client";

import { useState, useCallback } from "react";
import { runBumnan95 } from "@/workers/bumnan95.worker";
import type { Bumnan95Inputs, Bumnan95Results } from "@/types/calculator";

export function useBumnan95Worker() {
  const [results, setResults] = useState<Bumnan95Results | null>(null);
  const [computing, setComputing] = useState(false);

  const compute = useCallback((inputs: Bumnan95Inputs) => {
    setComputing(true);
    try {
      setResults(runBumnan95(inputs));
    } finally {
      setComputing(false);
    }
  }, []);

  return { results, computing, compute };
}
