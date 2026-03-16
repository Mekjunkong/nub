"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Hook that animates a number from 0 (or previous value) to target.
 */
export function useAnimatedNumber(
  target: number,
  duration: number = 1000,
  enabled: boolean = true
): number {
  const [current, setCurrent] = useState(0);
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setCurrent(target);
      return;
    }

    startValueRef.current = current;
    startTimeRef.current = performance.now();

    function animate(now: number) {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = startValueRef.current + (target - startValueRef.current) * eased;
      setCurrent(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, enabled]);

  return current;
}
