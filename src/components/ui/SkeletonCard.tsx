export default function SkeletonCard() {
  return (
    <div className="backdrop-blur-md bg-white/90 dark:bg-[#111827]/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col h-full animate-pulse">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
        <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
        <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
        <div className="w-5/6 h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
      </div>
      <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200/80 dark:border-slate-800/80 flex justify-between items-center">
        <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    </div>
  );
}
