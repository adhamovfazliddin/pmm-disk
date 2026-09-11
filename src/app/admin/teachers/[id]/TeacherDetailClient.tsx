"use client";

import { ArrowLeft, BookOpen, Clock, Download, Eye, Link2, Mail, Phone, Calendar, User as UserIcon, ShieldBan, ShieldCheck, FileText, CheckCircle2, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useLanguage } from "@/lib/i18n";

type TeacherDetailClientProps = {
  teacher: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    isActive: boolean;
    description: string | null;
    driveFolderId: string | null;
    createdAt: Date;
    lastLoginAt: Date | null;
    department: { id: string; name: string } | null;
  };
  stats: {
    totalViews: number;
    totalDownloads: number;
    totalMaterials: number;
  };
  timeline: { name: string; views: number; downloads: number }[];
  materials: {
    id: string;
    title: string;
    subject: string;
    format: string;
    visibility: string;
    createdAt: Date;
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

export default function TeacherDetailClient({ teacher, stats, timeline, materials }: TeacherDetailClientProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header with Back button */}
      <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-300">
        <button
          onClick={() => router.push('/admin/teachers')}
          className="p-2.5 rounded-xl bg-white dark:bg-[#111827]/90 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">O'qituvchi profili</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">O'qituvchining to'liq ma'lumotlari va faoliyati</p>
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
                  {getInitials(teacher.name)}
                </div>
              </div>

              {/* Status badge */}
              <div className="flex justify-end pt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${teacher.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${teacher.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  {teacher.isActive ? 'Faol' : 'Bloklangan'}
                </span>
              </div>

              {/* Info */}
              <div className="mt-4 space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{teacher.name}</h2>
                <div className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 font-medium">
                  <UserIcon className="w-4 h-4" />
                  {teacher.department ? teacher.department.name : 'Kafedra biriktirilmagan'}
                </div>
              </div>

              {/* Details List */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200 break-all">{teacher.email}</p>
                  </div>
                </div>

                {teacher.description && (
                  <div className="flex items-start gap-3 text-sm pt-2 pb-1 border-y border-slate-100 dark:border-slate-800/50 my-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Tavsif (Ilmiy unvon, ma'lumot)</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed mt-0.5">{teacher.description}</p>
                    </div>
                  </div>
                )}

                {teacher.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Telefon</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{teacher.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tizimga qo'shilgan</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{new Date(teacher.createdAt).toLocaleDateString('uz-UZ')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Oxirgi marta kirgan</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{formatLastLogin(teacher.lastLoginAt)}</p>
                  </div>
                </div>

                {teacher.driveFolderId && (
                  <div className="flex items-center gap-3 text-sm pt-2">
                    <a
                      href={`https://drive.google.com/drive/folders/${teacher.driveFolderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-xl transition-colors font-medium border border-blue-200/50 dark:border-blue-800/50"
                    >
                      <Link2 className="w-4 h-4" /> Google Drive Jildi
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Activity */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300 delay-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Materiallar</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalMaterials}</p>
            </div>
            
            <div className="bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300 delay-150">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Jami ko'rishlar</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalViews}</p>
            </div>

            <div className="bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300 delay-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Jami yuklamalar</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalDownloads}</p>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 delay-300">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-500" />
                Faoliyat grafigi (Oxirgi 30 kun)
              </h2>
            </div>
            <div className="p-5 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(value) => value.split('-').slice(1).join('/')}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#ffffff' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                    itemStyle={{ fontSize: '13px', padding: '2px 0' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <Line type="monotone" name="Ko'rishlar" dataKey="views" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} dot={false} />
                  <Line type="monotone" name="Yuklamalar" dataKey="downloads" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 6 }} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assigned Materials */}
          <div className="bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 delay-400">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Biriktirilgan materiallar
              </h2>
              <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                Oxirgi 20 ta
              </span>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[400px] overflow-y-auto custom-scrollbar">
              {materials.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">Hech qanday material biriktirilmagan</p>
                </div>
              ) : (
                materials.map(mat => (
                  <div key={mat.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${mat.format === 'PDF' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : mat.format === 'Video' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-white truncate">{mat.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{mat.subject}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex px-2 py-0.5 text-[10px] uppercase font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded">
                        {mat.format}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">{new Date(mat.createdAt).toLocaleDateString('uz-UZ')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
