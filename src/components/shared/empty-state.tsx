"use client";

import { LottieLoader } from "./lottie-loader";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <LottieLoader src="/lottie/empty.json" className="h-32 w-32" />
      <div>
        <p className="text-lg font-semibold text-text">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
