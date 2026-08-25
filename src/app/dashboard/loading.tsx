import SkeletonTable from "@/components/ui/SkeletonTable";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-64 h-4" />
        </div>
      </div>

      {/* Filter Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80">
        <Skeleton className="flex-1 w-full h-10" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-20 h-10 rounded-full" />
          ))}
        </div>
      </div>

      <SkeletonTable rows={5} />
    </div>
  );
}
