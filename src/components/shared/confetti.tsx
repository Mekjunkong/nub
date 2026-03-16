"use client";

import { useEffect, useRef } from "react";

interface ConfettiProps {
  trigger: boolean;
}

export function Confetti({ trigger }: ConfettiProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (!trigger || fired.current) return;
    fired.current = true;

    import("canvas-confetti").then((mod) => {
      const confetti = mod.default;
      // Fire from both sides
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.2, y: 0.6 },
        colors: ["#4F7CF7", "#7C5CFC", "#34D399", "#FBBF24"],
      });
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.8, y: 0.6 },
        colors: ["#4F7CF7", "#7C5CFC", "#34D399", "#FBBF24"],
      });
    });
  }, [trigger]);

  return null;
}
