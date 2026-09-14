"use client";

import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0"></div>
      <div className="flex-1 space-y-3 w-full">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2"></div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
        <div className="h-9 w-full sm:w-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="h-9 w-10 sm:w-9 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0"></div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ columns = 5, rows = 5 }: { columns?: number, rows?: number }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-24"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
