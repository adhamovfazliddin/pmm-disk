import SkeletonTable from "@/components/ui/SkeletonTable";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="w-full bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/80">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5 px-4 py-2">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-20 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        <Skeleton className="h-6 w-48 mb-6" />
        <SkeletonTable rows={4} />
      </div>
    </div>
  );
}
