"use client";

import { useState, useMemo } from "react";
import { createTeacher, updateTeacher, toggleTeacherStatus, deleteTeacher, bulkToggleTeacherStatus, bulkDeleteTeachers } from "@/app/actions/user";
import {
  Plus, Edit, ShieldBan, ShieldCheck, Trash2, Search, FilterX,
  Mail, Lock, Eye, EyeOff, UserPlus, User as UserIcon, Briefcase,
  Link2, Info, Check, Loader2, X, Phone, BookOpen, BarChart2,
  Download, Clock, ExternalLink, CheckSquare, Square, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

type TeacherStats = { materials: number; views: number; downloads: number };

type TeacherWithStats = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  departmentId: string | null;
  department: { name: string } | null;
  description: string | null;
  driveFolderId: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
  stats: TeacherStats;
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

function exportToCSV(teachers: TeacherWithStats[]) {
  const header = ["Ism", "Email", "Telefon", "Kafedra", "Ilmiy unvon, daraja va qo'shimcha ma'lumotlar", "Status", "Materiallar", "Ko'rishlar", "Yuklamalar", "Oxirgi kirish", "Qo'shilgan sana"];
  const rows = teachers.map(t => [
    t.name,
    t.email,
    t.phone || "-",
    t.department?.name || "-",
    t.description?.replace(/"/g, '""') || "-",
    t.isActive ? "Faol" : "Nofaol",
    t.stats.materials,
    t.stats.views,
    t.stats.downloads,
    t.lastLoginAt ? new Date(t.lastLoginAt).toLocaleDateString("uz-UZ") : "Hech kirmagani",
    new Date(t.createdAt).toLocaleDateString("uz-UZ"),
  ]);

  const csv = [header, ...rows].map(row => row.map(cell => `"${cell}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `oqituvchilar_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TeachersClient({ initialTeachers, departments }: { initialTeachers: TeacherWithStats[], departments: {id: string, name: string}[] }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherWithStats | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherWithStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  const filteredTeachers = useMemo(() => initialTeachers.filter(teacher => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.phone || "").includes(searchQuery) ||
      (teacher.department?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && teacher.isActive) ||
      (statusFilter === 'inactive' && !teacher.isActive);
    return matchesSearch && matchesStatus;
  }), [initialTeachers, searchQuery, statusFilter]);

  const extractDriveId = (input: string) => {
    if (!input) return "";
    const match = input.match(/(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=|drive\/folders\/)|docs\.google\.com\/(?:document\/d\/|presentation\/d\/|spreadsheets\/d\/))([a-zA-Z0-9_-]{15,})/);
    return match ? match[1] : input;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = editingTeacher
      ? await updateTeacher(editingTeacher.id, formData)
      : await createTeacher(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(editingTeacher ? t('teacherUpdated') : t('teacherCreated'));
      setIsModalOpen(false);
      router.refresh();
    }
    setIsSubmitting(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleTeacherStatus(id, !currentStatus);
    toast.success(t('statusUpdated'));
    router.refresh();
  };

  const handleDelete = async () => {
    if (!teacherToDelete) return;
    setIsDeleting(true);
    const res = await deleteTeacher(teacherToDelete.id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("O'qituvchi o'chirildi");
      setTeacherToDelete(null);
      router.refresh();
    }
    setIsDeleting(false);
  };

  // Bulk selection
  const isAllSelected = filteredTeachers.length > 0 && filteredTeachers.every(t => selectedIds.has(t.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTeachers.map(t => t.id)));
    }
  };
  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkToggle = async (isActive: boolean) => {
    setIsBulkLoading(true);
    const res = await bulkToggleTeacherStatus([...selectedIds], isActive);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(`${selectedIds.size} ta o'qituvchi ${isActive ? 'faollashtirildi' : 'bloklandi'}`);
      setSelectedIds(new Set());
      router.refresh();
    }
    setIsBulkLoading(false);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`${selectedIds.size} ta o'qituvchini o'chirmoqchimisiz?`)) return;
    setIsBulkLoading(true);
    const res = await bulkDeleteTeachers([...selectedIds]);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(`${selectedIds.size} ta o'qituvchi o'chirildi`);
      setSelectedIds(new Set());
      router.refresh();
    }
    setIsBulkLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('teacherManagement')}</h1>
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
            {initialTeachers.length} {t('teachers') || "O'qituvchi"}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportToCSV(filteredTeachers)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-medium"
          >
            <Download className="w-4 h-4" /> CSV eksport
          </button>
          <button
            onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm font-medium"
          >
            <Plus className="w-5 h-5" /> {t('addTeacher')}
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchTeachers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white shadow-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer text-gray-900 dark:text-white sm:min-w-[160px] shadow-sm transition-all"
        >
          <option value="all">{t('statusAll')}</option>
          <option value="active">{t('active')}</option>
          <option value="inactive">{t('inactive')}</option>
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl animate-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            {selectedIds.size} ta tanlandi
          </span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <button
              disabled={isBulkLoading}
              onClick={() => handleBulkToggle(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Faollashtirish
            </button>
            <button
              disabled={isBulkLoading}
              onClick={() => handleBulkToggle(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-colors disabled:opacity-50"
            >
              <ShieldBan className="w-3.5 h-3.5" /> Bloklash
            </button>
            <button
              disabled={isBulkLoading}
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> O'chirish
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Bekor
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/80 dark:bg-[#111827]/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden backdrop-blur-md transition-colors">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-800/80 text-sm">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {isAllSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 w-10 text-center">№</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">{t('nameField')}</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Kafedra</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" /> Faoliyat</div>
                </th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Oxirgi kirish</div>
                </th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">{t('statusField')}</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">{t('actionsField')}</th>
              </tr>
            </thead>
            <tbody>
              {initialTeachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <ShieldBan className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                      <p className="text-lg font-medium">{t('noTeachers')}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FilterX className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                      <p className="text-lg font-medium">Qidiruv natijasida o'qituvchi topilmadi.</p>
                    </div>
                  </td>
                </tr>
              ) : null}
              {filteredTeachers.map((teacher, index) => (
                <tr key={teacher.id} className={`border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all ${selectedIds.has(teacher.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <td className="p-4 w-10">
                    <button onClick={() => toggleOne(teacher.id)} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {selectedIds.has(teacher.id)
                        ? <CheckSquare className="w-4 h-4 text-blue-600" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="p-4 text-center font-medium text-slate-500">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                        {getInitials(teacher.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => router.push(`/admin/teachers/${teacher.id}`)}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left flex items-center gap-1.5 group max-w-full"
                          title={teacher.name}
                        >
                          <span className="truncate">{teacher.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          <Mail className="w-3.5 h-3.5" />
                          {teacher.email}
                        </div>
                        {teacher.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {teacher.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    {teacher.department ? (
                      <span className="inline-flex px-2.5 py-1 text-[11px] uppercase tracking-wider font-semibold bg-slate-100 text-slate-600 dark:bg-[#1E293B]/60 dark:text-slate-300 rounded-md">
                        {teacher.department.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </td>
                  {/* Faoliyat statistikasi */}
                  <td className="p-4 align-middle">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <BookOpen className="w-3 h-3 text-blue-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{teacher.stats.materials}</span> material
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Eye className="w-3 h-3 text-emerald-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{teacher.stats.views}</span> ko'rish
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Download className="w-3 h-3 text-purple-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{teacher.stats.downloads}</span> yuklama
                      </span>
                    </div>
                  </td>
                  {/* Oxirgi kirish */}
                  <td className="p-4 align-middle">
                    <span className={`text-xs font-medium ${teacher.lastLoginAt ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 italic'}`}>
                      {formatLastLogin(teacher.lastLoginAt)}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${teacher.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-50 text-slate-600 border-slate-200/60 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${teacher.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {teacher.isActive ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => { setEditingTeacher(teacher); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                        title={t('editTeacher')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(teacher.id, teacher.isActive)}
                        className={`p-2 rounded-xl transition-all ${teacher.isActive ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-500/10' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10'}`}
                        title={teacher.isActive ? t('inactive') : t('active')}
                      >
                        {teacher.isActive ? <ShieldBan className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setTeacherToDelete(teacher)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                        title={t('delete')}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-[#0B0F17]/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] rounded-t-3xl sm:rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-[#111827]/50 sticky top-0 z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingTeacher ? t('editTeacher') : "Yangi o'qituvchi qo'shish"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingTeacher ? "O'qituvchi ma'lumotlarini tahrirlash" : "Tizimga yangi o'qituvchi qo'shing"}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1 items-start">
                {/* Ism */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('nameField')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      required
                      name="name"
                      defaultValue={editingTeacher?.name}
                      placeholder="To'liq ism (masalan: Alisher Xalilov)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('emailField')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      required
                      type="email"
                      name="email"
                      defaultValue={editingTeacher?.email}
                      placeholder="email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Telefon raqam
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={editingTeacher?.phone || ""}
                      placeholder="+998 90 000 00 00"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Parol */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {editingTeacher ? t('passwordLeaveBlank') : t('password')} {editingTeacher ? '' : <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required={!editingTeacher}
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Kafedrani tanlash */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Kafedrani tanlang
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      name="departmentId"
                      defaultValue={editingTeacher?.departmentId || ""}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">-- Kafedraga biriktirmaslik --</option>
                      {departments.map(dep => (
                        <option key={dep.id} value={dep.id}>
                          {dep.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Tavsif (Ilmiy unvoni, qo'shimcha ma'lumotlar) */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Tavsif (Ilmiy unvon, daraja va qo'shimcha ma'lumotlar)
                  </label>
                  <div className="relative">
                    <Info className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <textarea
                      name="description"
                      defaultValue={editingTeacher?.description || ""}
                      rows={3}
                      placeholder="Masalan: Pedagogika fanlari nomzodi, dotsent..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 resize-y"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#111827]/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 min-w-[140px]"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> {t('save')}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 bg-black/50 dark:bg-[#0B0F17]/70 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827]/90 rounded-t-2xl sm:rounded-xl p-6 w-full max-w-md shadow-lg border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300">
            <div className="w-full flex justify-center pb-4 sm:hidden" onClick={() => setTeacherToDelete(null)}>
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            </div>
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t('deleteTeacherTitle')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('deleteTeacherMessage')}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-medium disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium flex items-center justify-center min-w-[120px] disabled:opacity-70"
              >
                {isDeleting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : t('confirmDeleteTeacher')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
