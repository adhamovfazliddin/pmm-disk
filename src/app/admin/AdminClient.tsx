"use client";

import { Users, FileText, Globe, Lock, Eye, Download, Activity, Briefcase, Calendar, FileBadge, Pencil, Trash2, Video, ExternalLink, Plus, X, Link as LinkIcon, PlayCircle, BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import Link from "next/link";
import { useState } from "react";

function SubjectBarChart({ data, t }: { data: any[], t: any }) {
  const max = data.length > 0 ? Math.max(...data.map(d => d.count), 1) : 1;
  return (
    <div className="bg-white/80 dark:bg-[#111827]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">{t('subjectDistribution') || "Kafedralar / Fanlar bo'yicha materiallar"}</h3>
      <div className="flex-1 space-y-4">
        {(!data || data.length === 0) && <p className="text-sm text-gray-500">Ma'lumot topilmadi</p>}
        {data?.map((item, idx) => {
          const percentage = (item.count / max) * 100;
          return (
            <div key={idx} className="group relative">
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-4">{item.name}</span>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">{item.count}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#1E293B]/60 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FORMAT_COLORS: Record<string, string> = {
  PDF: "from-red-500 to-red-600",
  PRESENTATION: "from-orange-500 to-orange-600",
  VIDEO: "from-blue-500 to-blue-600",
  DOCUMENT: "from-blue-400 to-blue-500",
  SPREADSHEET: "from-emerald-500 to-emerald-600",
  IMAGE: "from-purple-500 to-purple-600",
  ARCHIVE: "from-gray-500 to-gray-600",
  OTHER: "from-slate-500 to-slate-600"
};

function FormatDistributionChart({ data, t }: { data: any[], t: any }) {
  const total = data?.reduce((sum, item) => sum + item.count, 0) || 1;
  return (
    <div className="bg-white/80 dark:bg-[#111827]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">{t('formatDistribution') || "Formatlar taqsimoti"}</h3>
      <div className="flex-1 space-y-6">
        {(!data || data.length === 0) && <p className="text-sm text-gray-500">Ma'lumot topilmadi</p>}
        {data?.map((item, idx) => {
          const percentage = (item.count / total) * 100;
          const colorClass = FORMAT_COLORS[item.name.toUpperCase()] || "from-emerald-500 to-emerald-600";
          return (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${colorClass}`}></div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-sm uppercase">{item.name}</span>
                </div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {percentage.toFixed(1)}% <span className="text-slate-400 font-normal text-xs ml-1">({item.count})</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#1E293B]/60 rounded-full h-2 overflow-hidden">
                <div 
                  className={`bg-gradient-to-r ${colorClass} h-2 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AdminClientProps {
  totalTeachers: number;
  totalMaterials: number;
  activeDepartments: number;
  recentMaterials: any[];
  analytics: any;
}

export default function AdminClient({
  totalTeachers,
  totalMaterials,
  activeDepartments,
  recentMaterials,
  analytics
}: AdminClientProps) {
  const { t, language } = useLanguage();

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'UZ' ? 'uz-UZ' : 'ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t('adminDashboard')}</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/resources" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20">
            <BookOpen className="w-4 h-4" /> {t('resources')}
          </Link>
          <Link href="/admin/materials" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-blue-500/20">
            {t('addMaterial')}
          </Link>
          <Link href="/admin/teachers" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E293B]/60 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium rounded-xl transition-all shadow-sm">
            {t('addDepartment')}
          </Link>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/80">
          {/* Item 1: Jami o'qituvchilar */}
          <div className="flex items-center gap-3.5 px-4 py-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5"/>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('totalTeachers') || "Jami o'qituvchilar"}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalTeachers}</p>
            </div>
          </div>

          {/* Item 2: Jami materiallar */}
          <div className="flex items-center gap-3.5 px-4 py-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5"/>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('totalMaterials') || "Jami materiallar"}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalMaterials}</p>
            </div>
          </div>

          {/* Item 3: Jami ko'rishlar */}
          <div className="flex items-center gap-3.5 px-4 py-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5"/>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('totalViews') || "Jami ko'rishlar"}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{analytics?.totalViews || 0}</p>
            </div>
          </div>

          {/* Item 4: Faol kafedralar */}
          <div className="flex items-center gap-3.5 px-4 py-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5"/>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('activeDepartments') || "Faol kafedralar"}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{activeDepartments}</p>
            </div>
          </div>

          {/* Item 5: Jami yuklab olishlar */}
          <div className="flex items-center gap-3.5 px-4 py-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5"/>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('totalDownloads') || "Jami yuklab olishlar"}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{analytics?.totalDownloads || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* The charts have been moved down */}

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('recentMaterials')}</h2>
        <div className="backdrop-blur-md bg-white/90 dark:bg-[#111827]/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-700/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('titleField')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('formatField')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('subjectField')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('authorDate')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {recentMaterials.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <FileBadge className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{m.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-[#1E293B]/60 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                        {m.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {m.subject}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{m.createdBy?.name}</span>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span suppressHydrationWarning>{formatDate(m.createdAt)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={`https://drive.google.com/file/d/${m.driveFileId}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Ko'rish"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <Link 
                          href="/admin/materials"
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                          title="Tahrirlash"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => {
                            if (confirm("Rostdan ham o'chirmoqchimisiz? O'chirish amalini Materiallar bo'limidan bajaring.")) {
                              window.location.href = "/admin/materials";
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {analytics && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-6">{t('analyticsTitle')}</h2>

          {analytics.subjectDistribution && analytics.formatDistribution && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SubjectBarChart data={analytics.subjectDistribution} t={t} />
              <FormatDistributionChart data={analytics.formatDistribution} t={t} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 mb-8">

            <div className="backdrop-blur-md bg-white/90 dark:bg-[#111827]/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 p-6 transition-colors">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">{t('topMaterials')}</h3>
              <div className="space-y-4">
                {analytics.topMaterials.map((m: any, idx: number) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#1E293B]/60 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{m.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{m.subject}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm font-medium">
                      <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                        <Eye className="w-4 h-4" /> {m.views}
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <Download className="w-4 h-4" /> {m.downloads}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/90 dark:bg-[#111827]/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('topTeachers')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-700/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">O'qituvchi</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Faollik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {analytics.topTeachers.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400">{t.email}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {t.activityCount} harakat
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
