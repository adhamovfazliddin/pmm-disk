"use client";

import { useState } from "react";
import { createTeacher, updateTeacher, toggleTeacherStatus, deleteTeacher } from "@/app/actions/user";
import { User } from "@prisma/client";
import { Plus, Edit, ShieldBan, ShieldCheck, Trash2, Search, FilterX } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

export default function TeachersClient({ initialTeachers }: { initialTeachers: User[] }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  };

  const filteredTeachers = initialTeachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && teacher.isActive) || 
                          (statusFilter === 'inactive' && !teacher.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let res;
    if (editingTeacher) {
      res = await updateTeacher(editingTeacher.id, formData);
    } else {
      res = await createTeacher(formData);
    }

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(editingTeacher ? t('teacherUpdated') : t('teacherCreated'));
      setIsModalOpen(false);
      router.refresh();
    }
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
      toast.success(t('teacherDeleted') || "O'qituvchi o'chirildi");
      setTeacherToDelete(null);
      router.refresh();
    }
    setIsDeleting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t('teacherManagement')}</h1>
        <button 
          onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> {t('addTeacher')}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={t('searchTeachers')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-gray-900 dark:text-white"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-gray-900 dark:text-white sm:min-w-[160px]"
        >
          <option value="all">{t('statusAll')}</option>
          <option value="active">{t('active')}</option>
          <option value="inactive">{t('inactive')}</option>
        </select>
      </div>

      <div className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-colors">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-700/50">
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">{t('nameField')}</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">{t('emailField')}</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">{t('statusField')}</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">{t('actionsField')}</th>
            </tr>
          </thead>
          <tbody>
            {initialTeachers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <ShieldBan className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    <p className="text-lg font-medium">{t('noTeachers')}</p>
                  </div>
                </td>
              </tr>
            ) : filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FilterX className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    <p className="text-lg font-medium">Qidiruv natijasiga ko'ra o'qituvchi topilmadi.</p>
                  </div>
                </td>
              </tr>
            ) : null}
            {filteredTeachers.map((teacher) => (
              <tr key={teacher.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border border-blue-200/50 dark:border-blue-700/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm shadow-sm">
                      {getInitials(teacher.name)}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">{teacher.name}</div>
                  </div>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400">{teacher.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${teacher.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50'}`}>
                    {teacher.isActive ? t('active') : t('inactive')}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button 
                    onClick={() => { setEditingTeacher(teacher); setIsModalOpen(true); }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title={t('editTeacher')}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => toggleStatus(teacher.id, teacher.isActive)}
                    className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:text-gray-400 dark:hover:text-amber-400 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                    title={teacher.isActive ? t('inactive') : t('active')}
                  >
                    {teacher.isActive ? <ShieldBan className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setTeacherToDelete(teacher)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-xl p-6 w-full max-w-md shadow-lg border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
            {/* Mobile Drag Handle */}
            <div className="w-full flex justify-center pb-4 sm:hidden cursor-grab" onClick={() => setIsModalOpen(false)}>
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            </div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{editingTeacher ? t('editTeacher') : t('addTeacher')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('nameField')}</label>
                <input required name="name" defaultValue={editingTeacher?.name} className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('emailField')}</label>
                <input required type="email" name="email" defaultValue={editingTeacher?.email} className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {editingTeacher ? t('passwordLeaveBlank') : t('password')}
                </label>
                <input type="password" name="password" required={!editingTeacher} minLength={6} className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('departmentDescription')}</label>
                <textarea name="description" rows={3} defaultValue={editingTeacher?.description || ""} className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white custom-scrollbar resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('driveFolderLink')}</label>
                <input type="text" name="driveFolderId" defaultValue={editingTeacher?.driveFolderId || ""} placeholder="https://drive.google.com/drive/folders/..." className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-xl p-6 w-full max-w-md shadow-lg border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
            {/* Mobile Drag Handle */}
            <div className="w-full flex justify-center pb-4 sm:hidden cursor-grab" onClick={() => setTeacherToDelete(null)}>
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            </div>
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              {t('deleteTeacherTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('deleteTeacherMessage')}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setTeacherToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium flex items-center justify-center min-w-[120px] disabled:opacity-70"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  t('confirmDeleteTeacher')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
