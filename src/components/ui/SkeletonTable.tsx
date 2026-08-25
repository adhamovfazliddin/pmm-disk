import React from "react";
import { Skeleton } from "./Skeleton";

export default function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="backdrop-blur-md bg-white/90 dark:bg-[#111827]/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
      {/* Table Header Skeleton */}
      <div className="bg-slate-50/50 dark:bg-[#1E293B]/60 border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4 flex gap-4">
        <Skeleton className="w-1/4 h-5" />
        <Skeleton className="w-1/4 h-5 hidden sm:block" />
        <Skeleton className="w-1/4 h-5 hidden md:block" />
        <Skeleton className="w-1/4 h-5" />
      </div>
      
      {/* Table Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex gap-4 items-center">
            <div className="w-1/4 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-3" />
              </div>
            </div>
            <Skeleton className="w-1/4 h-6 rounded-full hidden sm:block" />
            <Skeleton className="w-1/4 h-4 hidden md:block" />
            <div className="w-1/4 flex justify-end gap-2">
              <Skeleton className="w-8 h-8 rounded-md" />
              <Skeleton className="w-8 h-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
