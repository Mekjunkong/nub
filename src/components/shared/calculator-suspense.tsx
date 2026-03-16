"use client";

import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CalculatorSuspenseProps {
  children: ReactNode;
}

function CalculatorFallback() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CalculatorSuspense({ children }: CalculatorSuspenseProps) {
  return (
    <Suspense fallback={<CalculatorFallback />}>
      {children}
    </Suspense>
  );
}
