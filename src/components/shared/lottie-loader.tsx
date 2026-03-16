"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottieLoaderProps {
  src: string;
  className?: string;
  loop?: boolean;
}

export function LottieLoader({ src, className, loop = true }: LottieLoaderProps) {
  const [animationData, setAnimationData] = useState<unknown>(null);

  useEffect(() => {
    fetch(src)
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(() => setAnimationData(null));
  }, [src]);

  if (!animationData) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Lottie
        animationData={animationData}
        loop={loop}
        style={{ width: "100%", height: "100%", maxWidth: 200, maxHeight: 200 }}
      />
    </div>
  );
}
