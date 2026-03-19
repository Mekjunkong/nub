"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function CalculatorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <AlertTriangle className="h-12 w-12 text-danger" />
      <h2 className="text-xl font-bold text-text">Something went wrong</h2>
      <p className="text-sm text-text-muted max-w-md text-center">
        {error.message || "An unexpected error occurred in the calculator."}
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
