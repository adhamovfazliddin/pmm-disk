export default function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden animate-pulse">
      {/* Table Header Skeleton */}
      <div className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4 flex gap-4">
        <div className="w-1/4 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="w-1/4 h-5 bg-slate-200 dark:bg-slate-700 rounded hidden sm:block"></div>
        <div className="w-1/4 h-5 bg-slate-200 dark:bg-slate-700 rounded hidden md:block"></div>
        <div className="w-1/4 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
      
      {/* Table Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex gap-4 items-center">
            <div className="w-1/4 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
            <div className="w-1/4 h-4 bg-slate-200 dark:bg-slate-700 rounded hidden sm:block"></div>
            <div className="w-1/4 h-4 bg-slate-200 dark:bg-slate-700 rounded hidden md:block"></div>
            <div className="w-1/4 flex justify-end gap-2">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
