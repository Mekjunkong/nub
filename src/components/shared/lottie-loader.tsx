"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottieLoaderProps {
  src: string;
  className?: string;
  loop?: boolean;
}

export function LottieLoader({ src, className, loop = true }: LottieLoaderProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Lottie
        animationData={undefined}
        path={src}
        loop={loop}
        style={{ width: "100%", height: "100%", maxWidth: 200, maxHeight: 200 }}
      />
    </div>
  );
}
