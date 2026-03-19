"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface NubLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 36, text: "text-xl" },
  lg: { icon: 48, text: "text-3xl" },
};

export function NubLogo({ size = "md", showText = true, className }: NubLogoProps) {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo.png"
        alt="Nub"
        width={s.icon}
        height={s.icon}
        className="rounded-lg shrink-0"
      />
      {showText && (
        <span className={cn("font-bold text-text font-heading", s.text)}>
          Nub
        </span>
      )}
    </div>
  );
}
