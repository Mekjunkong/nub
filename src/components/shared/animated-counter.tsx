"use client";

import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  format,
  duration = 1000,
  className,
}: AnimatedCounterProps) {
  const animated = useAnimatedNumber(value, duration);
  const display = format ? format(animated) : Math.round(animated).toLocaleString();

  return <span className={cn("tabular-nums", className)}>{display}</span>;
}
