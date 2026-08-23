"use client";

import { Users, FileText, Globe, Lock, Eye, Download, Activity, Briefcase, Calendar, FileBadge, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import Link from "next/link";

const FORMAT_COLORS: Record<string, string> = {
  PDF: "from-red-500 to-red-600",
  PPTX: "from-orange-500 to-orange-600",
  DOCX: "from-blue-500 to-blue-600",
  VIDEO: "from-purple-500 to-purple-600",
  MP4: "from-purple-500 to-purple-600",
  TXT: "from-gray-500 to-gray-600"
};

function SubjectBarChart({ data, t }: { data: any[], t: any }) {
  const max = data.length > 0 ? Math.max(...data.map(d => d.count), 1) : 1;
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col h-full">
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
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
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

function FormatDistributionChart({ data, t }: { data: any[], t: any }) {
  const total = data?.reduce((sum, item) => sum + item.count, 0) || 1;
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col h-full">
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
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
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

  const stats = [
    { name: t('totalTeachers'), value: totalTeachers, icon: Users, color: "text-white", bg: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30" },
    { name: t('totalMaterials'), value: totalMaterials, icon: FileText, color: "text-white", bg: "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30" },
    { name: t('totalViews') || "Ko'rishlar soni", value: analytics?.totalViews || 0, icon: Activity, color: "text-white", bg: "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30" },
    { name: t('activeDepartments'), value: activeDepartments, icon: Briefcase, color: "text-white", bg: "bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30" },
  ];

  const analyticsStats = analytics ? [
    { name: t('totalDownloads'), value: analytics.totalDownloads, icon: Download, color: "text-white", bg: "bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t('adminDashboard')}</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/materials" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-blue-500/20">
            <span className="text-lg leading-none">+</span> Material qo'shish
          </Link>
          <Link href="/admin/teachers" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium rounded-xl transition-all shadow-sm">
            <span className="text-lg leading-none">+</span> Yangi kafedra
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...stats, ...analyticsStats].map((stat) => (
          <div key={stat.name} className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* The charts have been moved down */}

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('recentMaterials')}</h2>
        <div className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-700/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('titleField')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('formatField')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('subjectField')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('authorDate')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
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
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
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
        <>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-6">{t('analyticsTitle')}</h2>

          {analytics.subjectDistribution && analytics.formatDistribution && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SubjectBarChart data={analytics.subjectDistribution} t={t} />
              <FormatDistributionChart data={analytics.formatDistribution} t={t} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 mb-8">

            <div className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 p-6 transition-colors">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">{t('topMaterials')}</h3>
              <div className="space-y-4">
                {analytics.topMaterials.map((m: any, idx: number) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
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

          <div className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-colors">
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
        </>
      )}
    </div>
  );
}
