import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page title */}
      <Skeleton className="h-8 w-40" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Health score card */}
            <Skeleton className="h-48 rounded-2xl" />
            {/* Quick actions */}
            <Skeleton className="h-48 rounded-2xl" />
          </div>
          {/* Saved plans */}
          <div>
            <Skeleton className="mb-3 h-5 w-28" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
