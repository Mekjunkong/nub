"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { DcaInputs, DcaResults } from "@/types/calculator";

export function useDcaWorker() {
  const [results, setResults] = useState<DcaResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculate = useCallback((inputs: DcaInputs) => {
    setIsCalculating(true);
    setResults(null);

    workerRef.current?.terminate();

    const worker = new Worker(
      new URL("../workers/dca-tracker.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e: MessageEvent<DcaResults>) => {
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
