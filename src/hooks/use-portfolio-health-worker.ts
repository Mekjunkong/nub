"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { PortfolioHealthInputs, PortfolioHealthResults } from "@/types/calculator";

export function usePortfolioHealthWorker() {
  const [results, setResults] = useState<PortfolioHealthResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculate = useCallback((inputs: PortfolioHealthInputs) => {
    setIsCalculating(true);
    setResults(null);
    setError(null);

    workerRef.current?.terminate();

    const worker = new Worker(
      new URL("../workers/portfolio-health.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e: MessageEvent<PortfolioHealthResults>) => {
      setResults(e.data);
      setIsCalculating(false);
    };

    worker.onerror = (e) => {
      setError(e.message || "Calculation failed");
      setResults(null);
      setIsCalculating(false);
    };

    workerRef.current = worker;
    worker.postMessage(inputs);
  }, []);

  return { results, isCalculating, calculate, error };
}
