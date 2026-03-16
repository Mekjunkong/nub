"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { MonteCarloInputs, MonteCarloResults } from "@/types/calculator";

export function useMonteCarloWorker() {
  const [results, setResults] = useState<MonteCarloResults | null>(null);
  const [partialResults, setPartialResults] =
    useState<MonteCarloResults | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [progress, setProgress] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculate = useCallback((inputs: MonteCarloInputs) => {
    setIsRefining(true);
    setProgress(0);
    setResults(null);
    setPartialResults(null);

    workerRef.current?.terminate();

    const worker = new Worker(
      new URL("../workers/monte-carlo.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e: MessageEvent<MonteCarloResults>) => {
      const data = e.data;
      if (data.partial) {
        setPartialResults(data);
        setProgress(50);
      } else {
        setResults(data);
        setPartialResults(null);
        setIsRefining(false);
        setProgress(100);
      }
    };

    worker.onerror = () => {
      setIsRefining(false);
    };

    workerRef.current = worker;
    worker.postMessage(inputs);
  }, []);

  return { results, partialResults, isRefining, progress, calculate };
}
