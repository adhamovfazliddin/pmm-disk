import SkeletonTable from "@/components/ui/SkeletonTable";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MaterialsLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-32 h-10" />
      </div>
      
      <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row gap-4">
        <Skeleton className="w-full md:w-64 h-10" />
        <Skeleton className="w-full md:w-48 h-10" />
      </div>

      <SkeletonTable rows={5} />
    </div>
  );
}
