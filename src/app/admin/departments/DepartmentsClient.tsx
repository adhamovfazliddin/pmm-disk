"use client";

import React, { useState, useMemo } from "react";
import { createDepartment, updateDepartment, toggleDepartmentStatus, deleteDepartment, bulkToggleDepartmentStatus, bulkDeleteDepartments } from "@/app/actions/department";
import {
  Plus, Edit, ShieldBan, ShieldCheck, Trash2, Search, FilterX,
  Mail, Lock, Eye, EyeOff, Building, Building2, Link2, Info,
  Check, Loader2, X, Users, ChevronDown, ChevronRight,
  CheckSquare, Square, Clock, Download, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type TeacherMini = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

type DepartmentWithTeachers = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  description: string | null;
  driveFolderId: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
  teachers: TeacherMini[];
  _count: { teachers: number };
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

function exportToCSV(departments: DepartmentWithTeachers[]) {
  const header = ["Kafedra nomi", "Email", "O'qituvchilar soni", "Status", "Oxirgi kirish", "Qo'shilgan"];
  const rows = departments.map(d => [
    d.name,
    d.email,
    d._count.teachers,
    d.isActive ? "Faol" : "Nofaol",
    d.lastLoginAt ? new Date(d.lastLoginAt).toLocaleDateString("uz-UZ") : "Hech kirmagani",
    new Date(d.createdAt).toLocaleDateString("uz-UZ"),
  ]);
  const csv = [header, ...rows].map(row => row.map(c => `"${c}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kafedralar_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DepartmentsClient({ initialDepartments }: { initialDepartments: DepartmentWithTeachers[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentWithTeachers | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<DepartmentWithTeachers | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  const filteredDepartments = useMemo(() => initialDepartments.filter(dep => {
    const matchesSearch =
      dep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && dep.isActive) ||
      (statusFilter === 'inactive' && !dep.isActive);
    return matchesSearch && matchesStatus;
  }), [initialDepartments, searchQuery, statusFilter]);

  const extractDriveId = (input: string) => {
    if (!input) return "";
    const match = input.match(/(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=|drive\/folders\/)|docs\.google\.com\/(?:document\/d\/|presentation\/d\/|spreadsheets\/d\/))([a-zA-Z0-9_-]{15,})/);
    return match ? match[1] : input;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = Object.fromEntries(formData.entries()) as Record<string, string>;
    if (editingDepartment) data.id = editingDepartment.id;

    const res = editingDepartment ? await updateDepartment(data) : await createDepartment(data);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(editingDepartment ? "Kafedra ma'lumotlari yangilandi" : "Kafedra muvaffaqiyatli qo'shildi");
      setIsModalOpen(false);
      router.refresh();
    }
    setIsSubmitting(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleDepartmentStatus(id, !currentStatus);
    toast.success("Status o'zgartirildi");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!departmentToDelete) return;
    setIsDeleting(true);
    const res = await deleteDepartment(departmentToDelete.id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Kafedra o'chirildi");
      setDepartmentToDelete(null);
      router.refresh();
    }
    setIsDeleting(false);
  };

  // Bulk selection
  const isAllSelected = filteredDepartments.length > 0 && filteredDepartments.every(d => selectedIds.has(d.id));
  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? new Set() : new Set(filteredDepartments.map(d => d.id)));
  };
  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkToggle = async (isActive: boolean) => {
    setIsBulkLoading(true);
    const res = await bulkToggleDepartmentStatus([...selectedIds], isActive);
    if (res?.error) { toast.error(res.error); } else {
      toast.success(`${selectedIds.size} ta kafedra ${isActive ? 'faollashtirildi' : 'bloklandi'}`);
      setSelectedIds(new Set());
      router.refresh();
    }
    setIsBulkLoading(false);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`${selectedIds.size} ta kafedrani o'chirmoqchimisiz?`)) return;
    setIsBulkLoading(true);
    const res = await bulkDeleteDepartments([...selectedIds]);
    if (res?.error) { toast.error(res.error); } else {
      toast.success(`${selectedIds.size} ta kafedra o'chirildi`);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kafedralar</h1>
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
            {initialDepartments.length} Kafedra
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportToCSV(filteredDepartments)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-medium"
          >
            <Download className="w-4 h-4" /> CSV eksport
          </button>
          <button
            onClick={() => { setEditingDepartment(null); setIsModalOpen(true); }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm font-medium"
          >
            <Plus className="w-5 h-5" /> Kafedra qo'shish
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Qidirish..."
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
          <option value="all">Barchasi</option>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl animate-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{selectedIds.size} ta tanlandi</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <button disabled={isBulkLoading} onClick={() => handleBulkToggle(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50">
              <ShieldCheck className="w-3.5 h-3.5" /> Faollashtirish
            </button>
            <button disabled={isBulkLoading} onClick={() => handleBulkToggle(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50">
              <ShieldBan className="w-3.5 h-3.5" /> Bloklash
            </button>
            <button disabled={isBulkLoading} onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 rounded-lg hover:bg-rose-200 transition-colors disabled:opacity-50">
              <Trash2 className="w-3.5 h-3.5" /> O'chirish
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              <X className="w-3.5 h-3.5" /> Bekor
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/80 dark:bg-[#111827]/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-800/80 text-sm">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    {isAllSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 w-10 text-center">№</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Nomi</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> O'qituvchilar</div>
                </th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Oxirgi kirish</div>
                </th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {initialDepartments.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-3">
                    <ShieldBan className="w-12 h-12 text-slate-300" />
                    <p className="text-lg font-medium">Kafedralar mavjud emas</p>
                  </div>
                </td></tr>
              ) : filteredDepartments.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-3">
                    <FilterX className="w-12 h-12 text-slate-300" />
                    <p className="text-lg font-medium">Qidiruv natijasiga ko'ra kafedra topilmadi.</p>
                  </div>
                </td></tr>
              ) : null}
              {filteredDepartments.map((dep, index) => (
                <React.Fragment key={dep.id}>
                  <tr className={`border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all ${selectedIds.has(dep.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    <td className="p-4 w-10">
                      <button onClick={() => toggleOne(dep.id)} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                        {selectedIds.has(dep.id) ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-4 text-center font-medium text-slate-500">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                          {getInitials(dep.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div 
                            className="cursor-pointer group"
                            onClick={() => router.push(`/admin/departments/${dep.id}`)}
                            title={dep.name}
                          >
                            <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1.5 transition-colors text-left max-w-full">
                              <span className="truncate">{dep.name}</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                              <Mail className="w-3.5 h-3.5" />{dep.email}
                            </div>
                            {dep.description && (
                              <div className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate">{dep.description}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* O'qituvchilar soni + expand tugmasi */}
                    <td className="p-4 align-middle">
                      <button
                        onClick={() => toggleExpand(dep.id)}
                        className="flex items-center gap-2 group"
                        disabled={dep._count.teachers === 0}
                      >
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${dep._count.teachers > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 cursor-pointer' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20 cursor-default'}`}>
                          <Users className="w-3 h-3" />
                          {dep._count.teachers} o'qituvchi
                        </span>
                        {dep._count.teachers > 0 && (
                          expandedIds.has(dep.id)
                            ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            : <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        )}
                      </button>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`text-xs font-medium ${dep.lastLoginAt ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 italic'}`}>
                        {formatLastLogin(dep.lastLoginAt)}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${dep.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-50 text-slate-600 border-slate-200/60 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dep.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {dep.isActive ? "Faol" : "Nofaol"}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => { setEditingDepartment(dep); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Tahrirlash">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleStatus(dep.id, dep.isActive)} className={`p-2 rounded-xl transition-all ${dep.isActive ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-500/10' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10'}`} title={dep.isActive ? "Bloklash" : "Faollashtirish"}>
                          {dep.isActive ? <ShieldBan className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setDepartmentToDelete(dep)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-xl transition-all" title="O'chirish">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expandable — o'qituvchilar ro'yxati */}
                  {expandedIds.has(dep.id) && dep.teachers.length > 0 && (
                    <tr className="bg-indigo-50/40 dark:bg-indigo-900/10 border-b border-slate-100 dark:border-slate-800/50">
                      <td colSpan={7} className="px-8 py-3">
                        <div className="flex flex-wrap gap-2">
                          {dep.teachers.map(teacher => (
                            <span key={teacher.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${teacher.isActive ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700 line-through'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${teacher.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                              {teacher.name}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-[#0B0F17]/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] rounded-t-3xl sm:rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-[#111827]/50 sticky top-0 z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingDepartment ? "Kafedrani tahrirlash" : "Yangi kafedra qo'shish"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingDepartment ? "Kafedra ma'lumotlarini tahrirlash" : "Tizimga yangi kafedra qo'shish"}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1 items-start">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Kafedra nomi <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input required name="name" defaultValue={editingDepartment?.name} placeholder="Kafedra nomi" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Elektron pochta / Login <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input required type="email" name="email" defaultValue={editingDepartment?.email} placeholder="kafedra@example.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {editingDepartment ? "Yangi parol (o'zgartirish uchun)" : "Parol"} {editingDepartment ? '' : <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input type={showPassword ? "text" : "password"} name="password" required={!editingDepartment} minLength={6} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" tabIndex={-1}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Google Drive Jildi</label>
                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input type="text" name="driveFolderId" defaultValue={editingDepartment?.driveFolderId || ""} onChange={(e) => e.target.value = extractDriveId(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400" />
                  </div>
                  <div className="flex items-start gap-2 mt-2">
                    <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ushbu kafedra uchun ajratilgan Google Drive jildi havolasi</p>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tavsif</label>
                  <div className="relative">
                    <Info className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <textarea name="description" rows={2} defaultValue={editingDepartment?.description || ""} placeholder="Kafedra haqida qo'shimcha ma'lumotlar" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 resize-none" />
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#111827]/50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50">Bekor qilish</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 min-w-[140px]">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Saqlash</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {departmentToDelete && (
        <div className="fixed inset-0 bg-black/50 dark:bg-[#0B0F17]/70 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827]/90 rounded-t-2xl sm:rounded-xl p-6 w-full max-w-md shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="w-full flex justify-center pb-4 sm:hidden" onClick={() => setDepartmentToDelete(null)}>
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            </div>
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Kafedrani o'chirish</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Haqiqatan ham ushbu kafedrani o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDepartmentToDelete(null)} disabled={isDeleting} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-medium disabled:opacity-50">Bekor qilish</button>
              <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium flex items-center justify-center min-w-[100px] disabled:opacity-70">
                {isDeleting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
