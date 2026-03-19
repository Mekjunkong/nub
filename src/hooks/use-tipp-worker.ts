"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { TippInputs, TippResults } from "@/types/calculator";

export function useTippWorker() {
  const [results, setResults] = useState<TippResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculate = useCallback((inputs: TippInputs) => {
    setIsCalculating(true);
    setResults(null);

    workerRef.current?.terminate();

    const worker = new Worker(
      new URL("../workers/tipp.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e: MessageEvent<TippResults>) => {
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
