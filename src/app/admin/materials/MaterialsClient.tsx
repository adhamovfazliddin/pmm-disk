"use client";

import { useState, useEffect } from "react";
import { createMaterial, deleteMaterial, updateMaterial } from "@/app/actions/material";
import { Plus, Trash2, ExternalLink, Download, Edit2, Search, Filter, LayoutGrid, List, FileText, Video, Presentation, FileArchive, File, BookOpen, Eye, Lock, FolderPlus, Globe, CheckSquare, XSquare, X, Check, Loader2, Info, Link2, UserCheck, Building2, User } from "lucide-react";
import { toast } from "sonner";

const FORMAT_ICONS = {
  PDF: <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200/60 dark:border-red-500/20"><FileText className="w-4 h-4" /><span className="text-xs font-semibold">PDF</span></div>,
  Video: <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20"><Video className="w-4 h-4" /><span className="text-xs font-semibold">Video</span></div>,
  Presentation: <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20"><Presentation className="w-4 h-4" /><span className="text-xs font-semibold">PPTX</span></div>,
  Archive: <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200/60 dark:border-slate-500/20"><FileArchive className="w-4 h-4" /><span className="text-xs font-semibold">Archive</span></div>,
  Document: <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20"><File className="w-4 h-4" /><span className="text-xs font-semibold">DOCX</span></div>,
};
import { useRouter } from "next/navigation";
import { getDrivePreviewUrl } from "@/lib/drive";
import { useLanguage } from "@/lib/i18n";

interface Material {
  id: string;
  title: string;
  description?: string | null;
  subject: string;
  format: string;
  driveFileId: string;
  visibility: "GLOBAL" | "RESTRICTED";
  assignments?: { teacher: { id: string } }[];
}

interface Assignee {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function MaterialsClient({ initialMaterials, activeAssignees }: { initialMaterials: Material[], activeAssignees: Assignee[] }) {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [format, setFormat] = useState("PDF");
  const [driveUrl, setDriveUrl] = useState("");
  const [visibility, setVisibility] = useState<"GLOBAL" | "RESTRICTED">("GLOBAL");
  const [assignedTeachers, setAssignedTeachers] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formatFilter, setFormatFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  };

  useEffect(() => {
    const saved = localStorage.getItem('materials_view_mode_admin');
    if (saved === 'grid' || saved === 'list') {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem('materials_view_mode_admin', mode);
  };

  const filteredMaterials = initialMaterials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          material.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (material.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = formatFilter === "ALL" || material.format === formatFilter;
    return matchesSearch && matchesFormat;
  });

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setSubject("");
    setFormat("PDF");
    setDriveUrl("");
    setVisibility("GLOBAL");
    setAssignedTeachers([]);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (material: Material) => {
    setIsEditMode(true);
    setEditingId(material.id);
    setTitle(material.title);
    setDescription(material.description || "");
    setSubject(material.subject);
    setFormat(material.format);
    setDriveUrl(material.driveFileId); // Use driveFileId directly so users can edit the ID without prefix
    setVisibility(material.visibility);
    setAssignedTeachers(material.assignments?.map((a: { teacher: { id: string } }) => a.teacher?.id) || []);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);
    
    try {
      const payload = {
        id: editingId,
        title,
        description,
        subject,
        format,
        driveUrl,
        visibility,
        assignedTeacherIds: visibility === "RESTRICTED" ? assignedTeachers : [],
      };

      const res = isEditMode ? await updateMaterial(payload) : await createMaterial(payload);

      if (res?.error) {
        toast.error(res.error);
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors as Record<string, string[]>);
        }
      } else {
        toast.success(isEditMode ? t('materialUpdated') : t('materialCreated'));
        setIsModalOpen(false);
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirmDelete'))) {
      await deleteMaterial(id);
      toast.success(t('materialDeleted'));
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t('materialsManagement')}</h1>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" /> {t('addMaterial')}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700/60 bg-slate-50/50 dark:bg-[#1E293B]/60 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 dark:bg-[#1E293B]/60 text-slate-900 dark:text-white min-w-[150px] transition-colors appearance-none"
            >
              <option value="ALL">{t('allFormats')}</option>
              <option value="PDF">PDF</option>
              <option value="Video">Video</option>
              <option value="Presentation">Presentation</option>
              <option value="Document">Document</option>
              <option value="Archive">Archive</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1E293B]/60 p-1 rounded-lg border border-slate-200 dark:border-slate-700/60 shrink-0">
            <button
              onClick={() => handleViewModeChange('grid')}
              title="Katakcha ko'rinishi / Сетка"
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              title="Ro'yxat ko'rinishi / Список"
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-slate-100 dark:bg-[#1E293B]/60 rounded-full">
                  <Search className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-lg font-medium">{t('noMaterials')}</p>
              </div>
            </div>
          ) : (
            filteredMaterials.map((material) => (
              <div key={material.id} className="backdrop-blur-md bg-white/90 dark:bg-[#111827]/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full group">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS] || <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200/60 dark:border-slate-500/20"><File className="w-4 h-4" /><span className="text-xs font-semibold">{material.format}</span></div>}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-[#1E293B]/60 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors">
                        <BookOpen className="w-3.5 h-3.5" /> {material.subject}
                      </span>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${material.visibility === 'GLOBAL' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20'}`}>
                        {material.visibility === 'GLOBAL' ? <Eye className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />} {material.visibility === 'GLOBAL' ? t('global') : t('restricted')}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2" title={material.title}>
                    {material.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 transition-colors">{material.description || ""}</p>
                </div>
                
                <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-3 mt-auto transition-colors">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium h-4">
                    {material.visibility === "RESTRICTED" && (
                       <span>Biriktirilganlar: {material.assignments?.length || 0}</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2 justify-end opacity-100">
                    <a 
                      href={getDrivePreviewUrl(material.driveFileId)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                      title={t('preview')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a 
                      href={`https://drive.google.com/uc?export=download&id=${material.driveFileId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
                      title={t('download')}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => openEditModal(material)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                      title={t('edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(material.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="backdrop-blur-md bg-white/90 dark:bg-[#111827]/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-700/50 text-sm">
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 w-12 text-center">№</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">{t('titleField')}</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">{t('subjectField')}</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">{t('formatField')}</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">{t('visibilityField')}</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Yuklangan sana</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">{t('actionsField')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-slate-100 dark:bg-[#1E293B]/60 rounded-full">
                        <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="text-lg font-medium">{t('noMaterials')}</p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredMaterials.map((material, index) => (
                <tr key={material.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group">
                  <td className="p-4 text-center font-medium text-slate-500">{index + 1}</td>
                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="truncate font-semibold">{material.title}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{material.description}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="flex items-center gap-1.5 w-max px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-[#1E293B]/60 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      <BookOpen className="w-3.5 h-3.5" /> {material.subject}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS] || <span className="text-sm font-medium">{material.format}</span>}
                  </td>
                  <td className="p-4 align-middle">
                    <span className={`flex w-max items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${material.visibility === 'GLOBAL' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20'}`}>
                      {material.visibility === 'GLOBAL' ? <Eye className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />} {material.visibility === 'GLOBAL' ? t('global') : t('restricted')}
                    </span>
                    {material.visibility === "RESTRICTED" && (
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Biriktirilganlar: {material.assignments?.length || 0}</p>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {new Date((material as any).createdAt || Date.now()).toLocaleDateString("ru-RU", {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end gap-1.5 opacity-100">
                      <a 
                        href={getDrivePreviewUrl(material.driveFileId)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                        title={t('preview')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a 
                        href={`https://drive.google.com/uc?export=download&id=${material.driveFileId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
                        title={t('download')}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => openEditModal(material)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                        title={t('edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(material.id)}
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
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                  <FolderPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditMode ? t('editMaterial') : "Yangi material qo'shish"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Google Drive havolasi orqali yangi o'quv materialini tizimga biriktiring
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('titleField')}</label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input 
                        required 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Material nomi (masalan: Anesteziologiya asoslari)"
                        className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${fieldErrors.title ? 'border-red-500' : 'border-slate-200 dark:border-slate-700/60'} bg-slate-50 dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all`} 
                      />
                    </div>
                    {fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title.join(", ")}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('subjectField')}</label>
                      <div className="relative">
                        <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input 
                          required 
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Fan yoki yo'nalish nomi"
                          className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${fieldErrors.subject ? 'border-red-500' : 'border-slate-200 dark:border-slate-700/60'} bg-slate-50 dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all`} 
                        />
                      </div>
                      {fieldErrors.subject && <p className="text-red-500 text-xs mt-1">{fieldErrors.subject.join(", ")}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('formatField')}</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                           {format === 'PDF' && <FileText className="w-5 h-5 text-red-500" />}
                           {(format === 'DOCX' || format === 'Document') && <File className="w-5 h-5 text-blue-500" />}
                           {(format === 'PPTX' || format === 'Presentation') && <Presentation className="w-5 h-5 text-orange-500" />}
                           {format === 'Video' && <Video className="w-5 h-5 text-purple-500" />}
                           {format === 'Archive' && <FileArchive className="w-5 h-5 text-slate-500" />}
                        </div>
                        <select 
                          required 
                          value={format}
                          onChange={(e) => setFormat(e.target.value)}
                          className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${fieldErrors.format ? 'border-red-500' : 'border-slate-200 dark:border-slate-700/60'} bg-slate-50 dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all appearance-none`}
                        >
                          <option value="PDF">PDF</option>
                          <option value="Video">Video</option>
                          <option value="Presentation">Presentation (PPTX)</option>
                          <option value="Document">Document (DOCX)</option>
                          <option value="Archive">Archive (ZIP)</option>
                        </select>
                      </div>
                      {fieldErrors.format && <p className="text-red-500 text-xs mt-1">{fieldErrors.format.join(", ")}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('description')}</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4} 
                      placeholder="Material haqida qisqacha ma'lumot..."
                      className={`w-full p-3.5 rounded-xl border ${fieldErrors.description ? 'border-red-500' : 'border-slate-200 dark:border-slate-700/60'} bg-slate-50 dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all custom-scrollbar`} 
                    />
                    {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description.join(", ")}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('driveUrl')}</label>
                    <div className="relative">
                      <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input 
                        required 
                        type="text" 
                        value={driveUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          const match = val.match(/(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=|drive\/folders\/)|docs\.google\.com\/(?:document\/d\/|presentation\/d\/|spreadsheets\/d\/))([a-zA-Z0-9_-]{15,})/);
                          setDriveUrl(match ? match[1] : val);
                        }}
                        placeholder="https://drive.google.com/file/d/... yoki Fayl ID" 
                        className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${fieldErrors.driveUrl ? 'border-red-500' : 'border-slate-200 dark:border-slate-700/60'} bg-slate-50 dark:bg-[#1E293B]/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all`} 
                      />
                    </div>
                    {fieldErrors.driveUrl && <p className="text-red-500 text-xs mt-1">{fieldErrors.driveUrl.join(", ")}</p>}
                    <div className="flex items-start gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                      <span>Fayl Google Drive'da «Barcha havola egalari uchun ochiq» holatda bo'lishi kerak.</span>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ko'rinish Huquqi</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setVisibility("GLOBAL")}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          visibility === "GLOBAL" 
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                            : "border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B]/30 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1E293B]/60"
                        }`}
                      >
                        <Globe className="w-6 h-6" />
                        <span className="text-sm font-medium">«Barchaga ochiq»</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisibility("RESTRICTED")}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          visibility === "RESTRICTED" 
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                            : "border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B]/30 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1E293B]/60"
                        }`}
                      >
                        <UserCheck className="w-6 h-6" />
                        <span className="text-sm font-medium text-center leading-tight">«Faqat tanlanganlarga»</span>
                      </button>
                    </div>
                  </div>

                  {/* Teachers assignment only shows if RESTRICTED */}
                  {visibility === "RESTRICTED" && (
                    <div className="flex flex-col h-full max-h-[360px] animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kafedra yoki O'qituvchilarni biriktirish</label>
                        
                        <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                          <button 
                            type="button" 
                            onClick={() => setAssignedTeachers(activeAssignees.map(t => t.id))}
                            className="flex items-center gap-1.5 px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all font-medium"
                          >
                            <CheckSquare className="w-3.5 h-3.5" /> Barchasi
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setAssignedTeachers([])}
                            className="flex items-center gap-1.5 px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-all font-medium"
                          >
                            <XSquare className="w-3.5 h-3.5" /> Tozalash
                          </button>
                        </div>
                      </div>
                      
                      <div className={`flex flex-col border ${fieldErrors.assignedTeacherIds ? 'border-red-500' : 'border-slate-200 dark:border-slate-700/60'} rounded-xl bg-slate-50 dark:bg-[#1E293B]/60 overflow-hidden flex-1`}>
                        <div className="p-2 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/50">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="Qidirish..." 
                              value={teacherSearchQuery}
                              onChange={(e) => setTeacherSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto p-2 space-y-1 max-h-[220px] custom-scrollbar">
                          {activeAssignees
                            .filter(t => t.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) || t.email.toLowerCase().includes(teacherSearchQuery.toLowerCase()))
                            .map(assignee => {
                              const isChecked = assignedTeachers.includes(assignee.id);
                              const isDepartment = assignee.role === "DEPARTMENT";
                              return (
                                <label key={assignee.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${isChecked ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50' : 'border-transparent hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}>
                                  <div className="relative flex items-center justify-center">
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setAssignedTeachers([...assignedTeachers, assignee.id]);
                                        } else {
                                          setAssignedTeachers(assignedTeachers.filter(id => id !== assignee.id));
                                        }
                                      }}
                                      className="peer w-5 h-5 opacity-0 absolute cursor-pointer"
                                    />
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 peer-hover:border-blue-400'}`}>
                                      {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                  </div>

                                  <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm shadow-sm ${isDepartment ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'}`}>
                                    {isDepartment ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                      {assignee.name} {isDepartment && <span className="ml-1 text-[10px] uppercase tracking-wider bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 px-1.5 py-0.5 rounded-sm">Kafedra</span>}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                      <span className="truncate">{assignee.email}</span>
                                    </div>
                                  </div>
                                </label>
                              )
                            })}
                            {activeAssignees.filter(t => t.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) || t.email.toLowerCase().includes(teacherSearchQuery.toLowerCase())).length === 0 && (
                              <div className="p-6 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                                <Search className="w-6 h-6 text-slate-300" />
                                <span>Hech narsa topilmadi</span>
                              </div>
                            )}
                        </div>
                        {assignedTeachers.length > 0 && (
                          <div className="p-2.5 bg-slate-100/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700/60 text-xs font-medium text-slate-600 dark:text-slate-300 text-center">
                            Tanlandi: <span className="text-blue-600 dark:text-blue-400">{assignedTeachers.length} ta foydalanuvchi/kafedra</span>
                          </div>
                        )}
                      </div>
                      {fieldErrors.assignedTeacherIds && <p className="text-red-500 text-xs mt-1">{fieldErrors.assignedTeacherIds.join(", ")}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isEditMode ? t('save') : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
