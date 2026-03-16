"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { RetirementInputs, RetirementResults } from "@/types/calculator";

export function useRetirementWorker() {
  const [results, setResults] = useState<RetirementResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculate = useCallback((inputs: RetirementInputs) => {
    setIsCalculating(true);

    // Terminate existing worker
    workerRef.current?.terminate();

    const worker = new Worker(
      new URL("../workers/retirement-planner.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e: MessageEvent<RetirementResults>) => {
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
