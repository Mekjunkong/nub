"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface NubLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: 36 },
  md: { icon: 44 },
  lg: { icon: 56 },
};

export function NubLogo({ size = "md", className }: NubLogoProps) {
  const s = sizes[size];

  return (
    <Image
      src="/logo.png"
      alt="Nub Retirement Planner"
      width={s.icon}
      height={s.icon}
      className={cn("rounded-lg shrink-0", className)}
    />
  );
}
