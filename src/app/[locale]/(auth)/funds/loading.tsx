import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Page title */}
      <Skeleton className="h-8 w-48" />

      {/* Filter bar */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        {/* Header */}
        <Skeleton className="h-10 w-full" />
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full border-t border-border" />
        ))}
      </div>
    </div>
  );
}
