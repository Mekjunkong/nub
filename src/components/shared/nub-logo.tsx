"use client";

import { cn } from "@/lib/utils";

interface NubLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: "text-lg", radius: 8 },
  md: { icon: 36, text: "text-xl", radius: 10 },
  lg: { icon: 48, text: "text-3xl", radius: 14 },
};

export function NubLogo({ size = "md", showText = true, className }: NubLogoProps) {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: s.icon,
          height: s.icon,
          background: "linear-gradient(135deg, #4F7CF7, #7C5CFC)",
          borderRadius: s.radius,
        }}
      >
        <svg
          width={s.icon * 0.55}
          height={s.icon * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
          <path
            d="M9 16V12.5L12 9.5L15 12.5V16"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-bold text-text font-heading", s.text)}>
          Nub
        </span>
      )}
    </div>
  );
}
