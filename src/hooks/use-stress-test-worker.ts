"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { StressTestInputs, StressTestResults } from "@/types/calculator";

export function useStressTestWorker() {
  const [results, setResults] = useState<StressTestResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculate = useCallback((inputs: StressTestInputs) => {
    setIsCalculating(true);
    setResults(null);

    workerRef.current?.terminate();

    const worker = new Worker(
      new URL("../workers/stress-test.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e: MessageEvent<StressTestResults>) => {
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
