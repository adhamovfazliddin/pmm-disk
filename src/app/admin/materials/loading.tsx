import SkeletonTable from "@/components/ui/SkeletonTable";

export default function MaterialsLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
      </div>
      
      <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="w-full md:w-48 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
      </div>

      <SkeletonTable rows={5} />
    </div>
  );
}
