"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { MptInputs, MptResults } from "@/types/calculator";

export function useMptWorker() {
  const [results, setResults] = useState<MptResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculate = useCallback((inputs: MptInputs) => {
    setIsCalculating(true);
    setResults(null);

    workerRef.current?.terminate();

    const worker = new Worker(
      new URL("../workers/mpt-optimizer.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e: MessageEvent<MptResults>) => {
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
