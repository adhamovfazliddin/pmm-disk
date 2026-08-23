import SkeletonCard from "@/components/ui/SkeletonCard";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
          <div className="w-64 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Filter Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex-1 w-full h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-20 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
