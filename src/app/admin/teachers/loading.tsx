export default function TeachersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="h-10 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-10 w-full sm:max-w-xs bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="h-10 w-full sm:w-40 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
      </div>

      <div className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        <div className="w-full">
          <div className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-700/50 grid grid-cols-4 gap-4 p-4">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-4 gap-4 p-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
