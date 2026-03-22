"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface NubLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: 40 },
  md: { icon: 56 },
  lg: { icon: 64 },
};

export function NubLogo({ size = "md", className }: NubLogoProps) {
  const s = sizes[size];

  return (
    <Image
      src="/logo.webp"
      alt="Nub Retirement Planner"
      width={s.icon}
      height={s.icon}
      className={cn("rounded-lg shrink-0", className)}
    />
  );
}
