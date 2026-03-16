"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { TaxInputs, TaxResults } from "@/types/calculator";

export function useTaxWorker() {
  const [results, setResults] = useState<TaxResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculate = useCallback((inputs: TaxInputs) => {
    setIsCalculating(true);
    setResults(null);

    workerRef.current?.terminate();

    const worker = new Worker(
      new URL("../workers/tax-optimizer.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e: MessageEvent<TaxResults>) => {
      setResults(e.data);
      setIsCalculating(false);
    };

    worker.onerror = () => {
      setIsCalculating(false);
    };

    workerRef.current = worker;
    worker.postMessage(inputs);
  }, []);

  return { results, isCalculating, calculate };
}
