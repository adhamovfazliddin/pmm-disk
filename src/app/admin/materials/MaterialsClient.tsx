"use client";

import { useState, useEffect } from "react";
import { createMaterial, deleteMaterial, updateMaterial } from "@/app/actions/material";
import { Plus, Trash2, ExternalLink, Download, Edit2, Search, Filter, LayoutGrid, List, FileText, Video, Presentation, FileArchive, File } from "lucide-react";
import { toast } from "sonner";

const FORMAT_ICONS = {
  PDF: <FileText className="w-5 h-5 text-red-500" />,
  Video: <Video className="w-5 h-5 text-purple-500" />,
  Presentation: <Presentation className="w-5 h-5 text-orange-500" />,
  Archive: <FileArchive className="w-5 h-5 text-indigo-500" />,
  Document: <File className="w-5 h-5 text-blue-600" />,
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

interface Teacher {
  id: string;
  name: string;
  email: string;
}

export default function MaterialsClient({ initialMaterials, activeTeachers }: { initialMaterials: Material[], activeTeachers: Teacher[] }) {
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

      <div className="flex flex-col md:flex-row gap-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-w-[150px] transition-colors appearance-none"
            >
              <option value="ALL">{t('allFormats')}</option>
              <option value="PDF">PDF</option>
              <option value="Video">Video</option>
              <option value="Presentation">Presentation</option>
              <option value="Document">Document</option>
              <option value="Archive">Archive</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
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
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
              {t('noMaterials')}
            </div>
          ) : (
            filteredMaterials.map((material) => (
              <div key={material.id} className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors">
                      {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS] || <File className="w-5 h-5 text-gray-500" />}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800 transition-colors">
                        {material.subject}
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${material.visibility === 'GLOBAL' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50'}`}>
                        {material.visibility === 'GLOBAL' ? t('global') : t('restricted')}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2" title={material.title}>
                    {material.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 transition-colors">{material.description || ""}</p>
                </div>
                
                <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-3 mt-auto transition-colors">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium h-4">
                    {material.visibility === "RESTRICTED" && (
                       <span>{t('assignedTeachers')}: {material.assignments?.length || 0}</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <a 
                      href={getDrivePreviewUrl(material.driveFileId)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      title={t('preview')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a 
                      href={`https://drive.google.com/uc?export=download&id=${material.driveFileId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-white dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      title={t('download')}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => openEditModal(material)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      title={t('edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(material.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-rose-200 dark:hover:border-slate-700"
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
        <div className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-700/50">
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">{t('titleField')}</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">{t('subjectField')}</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">{t('formatField')}</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">{t('visibilityField')}</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">{t('actionsField')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">{t('noMaterials')}</td>
                </tr>
              )}
              {filteredMaterials.map((material) => (
                <tr key={material.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                    <div className="flex flex-col">
                      <span className="truncate">{material.title}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{material.description}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{material.subject}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{material.format}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${material.visibility === 'GLOBAL' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50'}`}>
                      {material.visibility === 'GLOBAL' ? t('global') : t('restricted')}
                    </span>
                    {material.visibility === "RESTRICTED" && (
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('assignedTeachers')}: {material.assignments?.length || 0}</p>
                    )}
                  </td>
                  <td className="p-4 flex gap-2">
                    <a 
                      href={getDrivePreviewUrl(material.driveFileId)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title={t('preview')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a 
                      href={`https://drive.google.com/uc?export=download&id=${material.driveFileId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title={t('download')}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => openEditModal(material)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title={t('edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(material.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
      </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
            {/* Mobile Drag Handle */}
            <div className="w-full flex justify-center pb-4 sm:hidden cursor-grab" onClick={() => setIsModalOpen(false)}>
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            </div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {isEditMode ? t('editMaterial') : t('addMaterial')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('titleField')}</label>
                    <input 
                      required 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full border ${fieldErrors.title ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-colors`} 
                    />
                    {fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title.join(", ")}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('description')}</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4} 
                      className={`w-full border ${fieldErrors.description ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-colors`} 
                    />
                    {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description.join(", ")}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('driveUrl')}</label>
                    <input 
                      required 
                      type="text" 
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/... or just ID" 
                      className={`w-full border ${fieldErrors.driveUrl ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-colors`} 
                    />
                    {fieldErrors.driveUrl && <p className="text-red-500 text-xs mt-1">{fieldErrors.driveUrl.join(", ")}</p>}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('subjectField')}</label>
                      <input 
                        required 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className={`w-full border ${fieldErrors.subject ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-colors`} 
                      />
                      {fieldErrors.subject && <p className="text-red-500 text-xs mt-1">{fieldErrors.subject.join(", ")}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('formatField')}</label>
                      <select 
                        required 
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className={`w-full border ${fieldErrors.format ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-colors appearance-none`}
                      >
                        <option value="PDF">PDF</option>
                        <option value="Video">Video</option>
                        <option value="Presentation">Presentation</option>
                        <option value="Document">Document</option>
                        <option value="Archive">Archive (ZIP)</option>
                      </select>
                      {fieldErrors.format && <p className="text-red-500 text-xs mt-1">{fieldErrors.format.join(", ")}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('visibilityField')}</label>
                    <select 
                      value={visibility} 
                      onChange={(e) => setVisibility(e.target.value as "GLOBAL" | "RESTRICTED")}
                      className={`w-full border ${fieldErrors.visibility ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-colors appearance-none`}
                    >
                      <option value="GLOBAL">{t('visibilityGlobal')}</option>
                      <option value="RESTRICTED">{t('visibilityRestricted')}</option>
                    </select>
                    {fieldErrors.visibility && <p className="text-red-500 text-xs mt-1">{fieldErrors.visibility.join(", ")}</p>}
                  </div>

                  {visibility === "RESTRICTED" && (
                    <div className="flex flex-col h-full max-h-[300px]">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('assignTeachers')}</label>
                        <div className="flex items-center gap-2 text-xs">
                          <button 
                            type="button" 
                            onClick={() => setAssignedTeachers(activeTeachers.map(t => t.id))}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Barchasini tanlash
                          </button>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <button 
                            type="button" 
                            onClick={() => setAssignedTeachers([])}
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:underline font-medium"
                          >
                            Tozalash
                          </button>
                        </div>
                      </div>
                      
                      <div className={`flex flex-col border ${fieldErrors.assignedTeacherIds ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-xl bg-slate-50 dark:bg-slate-800/50 overflow-hidden flex-1`}>
                        <div className="p-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="O'qituvchi izlash..." 
                              value={teacherSearchQuery}
                              onChange={(e) => setTeacherSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 text-sm bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto p-2 space-y-1 max-h-48 custom-scrollbar">
                          {activeTeachers
                            .filter(t => t.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) || t.email.toLowerCase().includes(teacherSearchQuery.toLowerCase()))
                            .map(teacher => {
                              const isChecked = assignedTeachers.includes(teacher.id);
                              return (
                                <label key={teacher.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setAssignedTeachers([...assignedTeachers, teacher.id]);
                                      } else {
                                        setAssignedTeachers(assignedTeachers.filter(id => id !== teacher.id));
                                      }
                                    }}
                                    className="w-4 h-4 rounded text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs shadow-sm">
                                    {getInitials(teacher.name)}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{teacher.name}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{teacher.email}</span>
                                  </div>
                                </label>
                              )
                            })}
                            {activeTeachers.filter(t => t.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) || t.email.toLowerCase().includes(teacherSearchQuery.toLowerCase())).length === 0 && (
                              <div className="p-4 text-center text-sm text-slate-500">Hech narsa topilmadi</div>
                            )}
                        </div>
                      </div>
                      {fieldErrors.assignedTeacherIds && <p className="text-red-500 text-xs mt-1">{fieldErrors.assignedTeacherIds.join(", ")}</p>}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">{t('cancel')}</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                  {isEditMode ? t('save') : t('saveMaterial')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
