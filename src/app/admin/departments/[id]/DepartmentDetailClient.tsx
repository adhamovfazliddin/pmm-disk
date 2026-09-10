"use client";

import { ArrowLeft, BookOpen, Clock, Download, Eye, Link2, Mail, Phone, Calendar, Users, FileText, BarChart2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useLanguage } from "@/lib/i18n";

type DepartmentDetailClientProps = {
  department: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    isActive: boolean;
    description: string | null;
    driveFolderId: string | null;
    createdAt: Date;
    lastLoginAt: Date | null;
    stats: {
      materials: number;
      views: number;
      downloads: number;
      teachersCount: number;
    }
  };
  chartData: { date: string; view: number; download: number }[];
  materials: {
    id: string;
    title: string;
    subject: string;
    format: string;
    visibility: string;
    createdAt: Date;
  }[];
  teachersList: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  }[];
};

function formatLastLogin(date: Date | null): string {
  if (!date) return "Hech kirmagani";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} kun oldin`;
  return new Date(date).toLocaleDateString("uz-UZ");
}

export default function DepartmentDetailClient({ department, chartData, materials, teachersList }: DepartmentDetailClientProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header with Back button */}
      <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-300">
        <button
          onClick={() => router.push('/admin/departments')}
          className="p-2.5 rounded-xl bg-white dark:bg-[#111827]/90 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kafedra profili</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Kafedra haqida batafsil ma'lumotlar va faoliyat statistikasi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Profile Card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Cover gradient */}
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

            <div className="px-6 pb-6 relative">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 p-1.5 absolute -top-10 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                  {getInitials(department.name)}
                </div>
              </div>

              {/* Status badge */}
              <div className="flex justify-end pt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${department.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${department.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  {department.isActive ? 'Faol' : 'Bloklangan'}
                </span>
              </div>

              {/* Info */}
              <div className="mt-4 space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{department.name}</h2>
                {department.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                    {department.description}
                  </p>
                )}
              </div>

              {/* Details List */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200 break-all">{department.email}</p>
                  </div>
                </div>

                {department.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Telefon</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{department.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tizimga qo'shilgan</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{new Date(department.createdAt).toLocaleDateString('uz-UZ')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Oxirgi marta kirgan</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{formatLastLogin(department.lastLoginAt)}</p>
                  </div>
                </div>

                {department.driveFolderId && (
                  <div className="flex items-center gap-3 text-sm pt-2">
                    <a
                      href={department.driveFolderId.startsWith('http') ? department.driveFolderId : `https://drive.google.com/drive/folders/${department.driveFolderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 font-medium rounded-xl transition-colors"
                    >
                      <Link2 className="w-4 h-4" /> Google Drive Jildi
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Teachers List Card */}
          <div className="bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                O'qituvchilar
              </h2>
              <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-md">
                {teachersList.length} ta
              </span>
            </div>
            <div className="p-4">
              {teachersList.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
                  Ushbu kafedraga hali o'qituvchi biriktirilmagan
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {teachersList.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {getInitials(t.name)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{t.email}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Charts */}
        <div className="space-y-6 lg:col-span-2">

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <div className="bg-white dark:bg-[#111827]/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">O'qituvchilar</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {department.stats.teachersCount}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827]/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Materiallar</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {department.stats.materials}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827]/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium">Jami ko'rishlar</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {department.stats.views}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827]/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Download className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium">Jami yuklamalar</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {department.stats.downloads}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-500" />
                Kafedra grafigi (Oxirgi 30 kun)
              </h2>
            </div>
            <div className="p-6 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Line
                    name="Ko'rishlar"
                    type="monotone"
                    dataKey="view"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    name="Yuklamalar"
                    type="monotone"
                    dataKey="download"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Materials List */}
          <div className="bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Biriktirilgan materiallar
              </h2>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                Oxirgi {materials.length} ta
              </span>
            </div>

            <div className="p-0">
              {materials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Materiallar topilmadi</h3>
                  <p className="text-xs text-slate-500 max-w-[200px]">Ushbu kafedraga yoki uning o'qituvchilariga hali material biriktirilmagan.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {materials.map((m) => (
                    <div key={m.id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3 overflow-hidden">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{m.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="truncate max-w-[120px]">{m.subject}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0"></span>
                            <span>{m.format}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0"></span>
                            <span>{new Date(m.createdAt).toLocaleDateString('uz-UZ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
