"use client";

import { useState, useMemo } from "react";
import { Plus, X, Pencil, Trash2, Video, ExternalLink, BookOpen, Search, Building2, Globe, PlayCircle, Sparkles, Type, Link2, AlignLeft, ShieldCheck, Lock, Loader2, Save, LayoutGrid, List } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { addGlobalResourceAction, deleteGlobalResourceAction, updateGlobalResourceAction } from "@/app/actions/resource";
import toast from "react-hot-toast";

interface Department {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
  department: { name: string } | null;
}

interface ResourcesClientProps {
  initialGlobalResources: any[];
  departments: Department[];
  teachers: Teacher[];
}

export default function ResourcesClient({
  initialGlobalResources,
  departments,
  teachers
}: ResourcesClientProps) {
  const { t } = useLanguage();

  const [globalResources, setGlobalResources] = useState(initialGlobalResources || []);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [newResource, setNewResource] = useState<{
    title: string;
    type: string;
    url: string;
    description: string;
    category: string;
    visibility: 'GLOBAL' | 'RESTRICTED';
    departmentIds: string[];
    teacherIds: string[];
  }>({
    title: '',
    type: 'video',
    url: '',
    description: '',
    category: 'Video Dars',
    visibility: 'GLOBAL',
    departmentIds: [],
    teacherIds: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL"); // ALL, VIDEO, LINK
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const openAddModal = () => {
    setEditingResourceId(null);
    setNewResource({
      title: '',
      type: 'video',
      url: '',
      description: '',
      category: 'Video Dars',
      visibility: 'GLOBAL',
      departmentIds: [],
      teacherIds: []
    });
    setIsResourceModalOpen(true);
  };

  const openEditModal = (resource: any) => {
    setEditingResourceId(resource.id);
    setNewResource({
      title: resource.title || '',
      type: resource.type || 'video',
      url: resource.url || '',
      description: resource.description || '',
      category: resource.category || (resource.type === 'video' ? 'Video Dars' : 'Foydali Link'),
      visibility: resource.visibility || 'GLOBAL',
      departmentIds: resource.departmentIds || [],
      teacherIds: resource.teacherIds || []
    });
    setIsResourceModalOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const resourceToSave = { ...newResource };
      // If global, clear ids
      if (resourceToSave.visibility === 'GLOBAL') {
        resourceToSave.departmentIds = [];
        resourceToSave.teacherIds = [];
      }

      if (editingResourceId) {
        const res = await updateGlobalResourceAction(editingResourceId, resourceToSave);
        if (res.success && res.resource) {
          setGlobalResources(globalResources.map(r => r.id === editingResourceId ? res.resource : r));
          toast.success("Resurs yangilandi");
        }
      } else {
        const res = await addGlobalResourceAction(resourceToSave);
        if (res.success && res.resource) {
          setGlobalResources([res.resource, ...globalResources]);
          toast.success("Resurs qo'shildi");
        }
      }
      setIsResourceModalOpen(false);
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (confirm("Ushbu resursni o'chirishni xohlaysizmi?")) {
      try {
        const res = await deleteGlobalResourceAction(id);
        if (res.success) {
          setGlobalResources(globalResources.filter(r => r.id !== id));
          toast.success("Resurs o'chirildi");
        }
      } catch (error) {
        toast.error("Xatolik yuz berdi");
      }
    }
  };

  const handleDepartmentToggle = (id: string) => {
    setNewResource(prev => {
      const isSelected = prev.departmentIds.includes(id);
      return {
        ...prev,
        departmentIds: isSelected 
          ? prev.departmentIds.filter(dId => dId !== id)
          : [...prev.departmentIds, id]
      };
    });
  };

  const handleTeacherToggle = (id: string) => {
    setNewResource(prev => {
      const isSelected = prev.teacherIds.includes(id);
      return {
        ...prev,
        teacherIds: isSelected 
          ? prev.teacherIds.filter(tId => tId !== id)
          : [...prev.teacherIds, id]
      };
    });
  };

  const filteredResources = useMemo(() => {
    return globalResources.filter((res) => {
      const matchesSearch = (res.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (res.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterCategory === "ALL" 
                            ? true 
                            : filterCategory === "VIDEO" 
                              ? res.type === "video" 
                              : res.type === "link";
      return matchesSearch && matchesFilter;
    });
  }, [globalResources, searchTerm, filterCategory]);

  const stats = {
    total: globalResources.length,
    videos: globalResources.filter(r => r.type === "video").length,
    links: globalResources.filter(r => r.type === "link").length,
    restricted: globalResources.filter(r => r.visibility === "RESTRICTED").length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Resurslarni Boshqarish</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Platformadagi foydali resurslar va video darslarni bu yerdan boshqarasiz.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Resurs qo'shish
        </button>
      </div>

      {/* Top Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jami Resurslar</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Video Darslar</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.videos}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Foydali Havolalar</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.links}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Kafedralarga biriktirilgan</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.restricted}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Resurslarni izlash (nomi yoki tavsifi bo'yicha)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700/60 bg-slate-50/50 dark:bg-[#1E293B]/60 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex flex-wrap gap-1.5 items-center bg-slate-100 dark:bg-[#1E293B]/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            {[
              { value: "ALL", label: "Barchasi" },
              { value: "VIDEO", label: "Video Darslar" },
              { value: "LINK", label: "Tashqi Havolalar" },
            ].map(fmt => (
              <button
                key={fmt.value}
                onClick={() => setFilterCategory(fmt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filterCategory === fmt.value
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 dark:hover:text-slate-200 dark:hover:bg-slate-700/50'
                  }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1E293B]/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
        {filteredResources.map((resource) => {
          const videoId = resource.type === "video" ? getYouTubeVideoId(resource.url) : null;
          
          return (
            <div key={resource.id} className={`backdrop-blur-md bg-white/90 dark:bg-[#111827]/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden group hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300 ${viewMode === 'list' ? 'flex flex-col sm:flex-row items-stretch' : 'flex flex-col h-full'}`}>
              
              {/* Card Banner/Thumbnail */}
              <div className={`${viewMode === 'list' ? 'w-full sm:w-64 border-r border-slate-100 dark:border-slate-800/50' : 'w-full aspect-video border-b border-slate-100 dark:border-slate-800/50'} relative shrink-0 overflow-hidden`}>
                {resource.type === "video" ? (
                  <div className="w-full h-full bg-slate-900 relative">
                    {videoId ? (
                      <>
                        <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt={resource.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-red-600/90 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                            <Video className="w-5 h-5 ml-1" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-300 p-4 min-h-[120px]">
                        <PlayCircle className="w-10 h-10 mb-2 opacity-50" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full min-h-[120px] bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="w-14 h-14 bg-white dark:bg-[#1E293B] rounded-full flex items-center justify-center shadow-sm relative z-10">
                      <Globe className="w-7 h-7 text-emerald-500" />
                    </div>
                  </div>
                )}
                
                {/* Action overlay Grid View */}
                {viewMode === 'grid' && (
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 z-20">
                    <button onClick={() => openEditModal(resource)} className="p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white text-blue-600 dark:text-blue-400 rounded-lg shadow-sm backdrop-blur-md transition-colors" title="Tahrirlash">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteResource(resource.id)} className="p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white text-red-600 dark:text-red-400 rounded-lg shadow-sm backdrop-blur-md transition-colors" title="O'chirish">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="absolute top-2 left-2 z-20">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border backdrop-blur-md shadow-sm flex items-center gap-1 ${
                      resource.type === 'video' 
                        ? 'bg-red-500/90 text-white border-red-400/50'
                        : 'bg-emerald-500/90 text-white border-emerald-400/50'
                    }`}>
                      {resource.type === 'video' ? <Video className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                      {resource.category || (resource.type === 'video' ? 'Video Dars' : 'Foydali Link')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className={`p-5 flex-1 flex flex-col ${viewMode === 'list' ? 'justify-center' : ''}`}>
                {viewMode === 'grid' && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border flex items-center gap-1.5 ${
                      resource.type === 'video' 
                        ? 'bg-red-50 text-red-600 border-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                    }`}>
                      {resource.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />} 
                      {resource.category}
                    </span>
                    
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border flex items-center gap-1.5 ${
                      (!resource.visibility || resource.visibility === 'GLOBAL')
                        ? 'bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                        : 'bg-purple-50 text-purple-600 border-purple-200/60 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
                    }`}>
                      {(!resource.visibility || resource.visibility === 'GLOBAL') ? 'Global / Barcha uchun' : 'Kafedralarga cheklangan'}
                    </span>
                  </div>
                )}
                
                <h3 className={`text-lg font-bold text-gray-900 dark:text-white ${viewMode === 'list' ? 'mb-1' : 'mb-2'} line-clamp-2 pr-2`}>
                  {resource.title}
                </h3>
                
                <p className={`text-gray-600 dark:text-gray-400 text-sm ${viewMode === 'list' ? 'mb-3 line-clamp-1' : 'mb-4 line-clamp-2'}`}>
                  {resource.description}
                </p>
                
                {resource.visibility === 'RESTRICTED' && (
                  <div className={`${viewMode === 'list' ? 'flex items-center gap-4' : 'mb-4 space-y-1.5'}`}>
                    {resource.departmentIds && resource.departmentIds.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> <span className="font-semibold text-slate-700 dark:text-slate-300">Kafedralar:</span> {resource.departmentIds.length} ta
                      </p>
                    )}
                    {resource.teacherIds && resource.teacherIds.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> <span className="font-semibold text-slate-700 dark:text-slate-300">O'qituvchilar:</span> {resource.teacherIds.length} ta
                      </p>
                    )}
                  </div>
                )}
                
                {viewMode === 'list' && (!resource.visibility || resource.visibility === 'GLOBAL') && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
                     <Globe className="w-3.5 h-3.5" /> Global / Barcha uchun
                  </p>
                )}

                {viewMode === 'grid' && (
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      resource.type === 'video' 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                    }`}>
                      {resource.type === 'video' ? "YouTube'da ko'rish" : "Veb-saytga o'tish"} <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
              
              {/* List View Actions */}
              {viewMode === 'list' && (
                <div className="p-5 sm:pl-0 flex flex-col justify-center gap-2 sm:border-l border-slate-100 dark:border-slate-800/50 sm:ml-5 shrink-0 sm:w-48">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    resource.type === 'video' 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                  }`}>
                    Havolani ochish <ExternalLink className="w-4 h-4" />
                  </a>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button onClick={() => openEditModal(resource)} className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg transition-colors text-xs font-semibold" title="Tahrirlash">
                      <Pencil className="w-3.5 h-3.5" /> Tahrirlash
                    </button>
                    <button onClick={() => handleDeleteResource(resource.id)} className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-red-600 dark:text-red-400 rounded-lg transition-colors text-xs font-semibold" title="O'chirish">
                      <Trash2 className="w-3.5 h-3.5" /> O'chirish
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredResources.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-[#1E293B]/60 flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Resurslar topilmadi</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              Siz izlayotgan shartlar bo'yicha hech qanday resurs mavjud emas yoki qidiruvni o'zgartirib ko'ring.
            </p>
            <button 
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Birinchi resursni qo'shish
            </button>
          </div>
        )}
      </div>

      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl w-full max-w-3xl border border-slate-200/80 dark:border-slate-800/80 my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingResourceId ? "Resursni Tahrirlash" : "Yangi Resurs Qo'shish"}
                </h3>
              </div>
              <button 
                onClick={() => setIsResourceModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form id="resource-form" onSubmit={handleSaveResource} className="space-y-8">
                
                {/* Asosiy Ma'lumotlar Section */}
                <div className="space-y-5">
                  <h4 className="text-sm font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">1. Asosiy Ma'lumotlar</h4>
                  
                  {/* Resurs Turi (Visual Cards) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewResource({...newResource, type: 'video', category: 'Video Dars'})}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        newResource.type === 'video'
                          ? 'border-red-500 bg-red-50 dark:bg-red-500/10 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700/60 hover:border-red-200 dark:hover:border-red-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-transparent'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        newResource.type === 'video' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        <PlayCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className={`font-bold ${newResource.type === 'video' ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>YouTube Video</h5>
                        <p className={`text-xs mt-1 ${newResource.type === 'video' ? 'text-red-600/80 dark:text-red-400/80' : 'text-slate-500 dark:text-slate-400'}`}>YouTube darslik havolasi</p>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setNewResource({...newResource, type: 'link', category: 'Foydali Link'})}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        newResource.type === 'link'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700/60 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-transparent'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        newResource.type === 'link' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className={`font-bold ${newResource.type === 'link' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>Veb-sayt / Link</h5>
                        <p className={`text-xs mt-1 ${newResource.type === 'link' ? 'text-blue-600/80 dark:text-blue-400/80' : 'text-slate-500 dark:text-slate-400'}`}>Foydali maqola yoki sayt</p>
                      </div>
                    </button>
                  </div>

                  {/* Sarlavha & URL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sarlavha</label>
                      <div className="relative">
                        <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="text" 
                          required
                          value={newResource.title}
                          onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl focus:border-emerald-500 dark:focus:border-emerald-500 outline-none transition-colors"
                          placeholder="Resurs nomi..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Resurs Havolasi (URL)</label>
                      <div className="relative">
                        <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="url" 
                          required
                          value={newResource.url}
                          onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl focus:border-emerald-500 dark:focus:border-emerald-500 outline-none transition-colors"
                          placeholder={newResource.type === 'video' ? "https://youtube.com/watch?v=..." : "https://..."}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tavsif */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Qisqacha Tavsif</label>
                      <span className="text-xs text-slate-400">{newResource.description.length} belgi</span>
                    </div>
                    <div className="relative">
                      <AlignLeft className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <textarea 
                        required
                        value={newResource.description}
                        onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl focus:border-emerald-500 dark:focus:border-emerald-500 outline-none resize-none h-28 transition-colors"
                        placeholder="Resurs haqida qisqacha ma'lumot kiriting..."
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Dostup Section */}
                <div className="space-y-5">
                  <h4 className="text-sm font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">2. Ruxsatlar (Dostup)</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewResource({...newResource, visibility: 'GLOBAL'})}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                        newResource.visibility === 'GLOBAL'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700/60 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-transparent'
                      }`}
                    >
                      <Globe className={`w-5 h-5 ${newResource.visibility === 'GLOBAL' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <div>
                        <h5 className={`font-semibold text-sm ${newResource.visibility === 'GLOBAL' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>Global (Barchaga)</h5>
                        <p className={`text-xs mt-0.5 ${newResource.visibility === 'GLOBAL' ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-slate-500 dark:text-slate-400'}`}>Hamma ko'ra oladi</p>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setNewResource({...newResource, visibility: 'RESTRICTED'})}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                        newResource.visibility === 'RESTRICTED'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700/60 hover:border-purple-200 dark:hover:border-purple-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-transparent'
                      }`}
                    >
                      <ShieldCheck className={`w-5 h-5 ${newResource.visibility === 'RESTRICTED' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
                      <div>
                        <h5 className={`font-semibold text-sm ${newResource.visibility === 'RESTRICTED' ? 'text-purple-700 dark:text-purple-400' : 'text-slate-700 dark:text-slate-300'}`}>Cheklangan</h5>
                        <p className={`text-xs mt-0.5 ${newResource.visibility === 'RESTRICTED' ? 'text-purple-600/80 dark:text-purple-400/80' : 'text-slate-500 dark:text-slate-400'}`}>Aniq shaxslar uchun</p>
                      </div>
                    </button>
                  </div>

                  {newResource.visibility === 'RESTRICTED' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                          <Building2 className="w-4 h-4 text-slate-500" /> Kafedralar ({newResource.departmentIds.length})
                        </label>
                        <div className="h-40 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
                          {departments.map(dept => (
                            <label key={dept.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${
                              newResource.departmentIds.includes(dept.id) 
                                ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-500/30 shadow-sm' 
                                : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
                            }`}>
                              <input 
                                type="checkbox"
                                checked={newResource.departmentIds.includes(dept.id)}
                                onChange={() => handleDepartmentToggle(dept.id)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 bg-transparent"
                              />
                              <span className={`text-sm line-clamp-1 ${newResource.departmentIds.includes(dept.id) ? 'font-medium text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>{dept.name}</span>
                            </label>
                          ))}
                          {departments.length === 0 && (
                            <div className="text-sm text-slate-500 text-center py-4">Kafedralar topilmadi</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                          <BookOpen className="w-4 h-4 text-slate-500" /> O'qituvchilar ({newResource.teacherIds.length})
                        </label>
                        <div className="h-40 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
                          {teachers.map(teacher => (
                            <label key={teacher.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${
                              newResource.teacherIds.includes(teacher.id) 
                                ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-500/30 shadow-sm' 
                                : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
                            }`}>
                              <input 
                                type="checkbox"
                                checked={newResource.teacherIds.includes(teacher.id)}
                                onChange={() => handleTeacherToggle(teacher.id)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 bg-transparent"
                              />
                              <div className="flex flex-col">
                                <span className={`text-sm line-clamp-1 ${newResource.teacherIds.includes(teacher.id) ? 'font-medium text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                  {teacher.name}
                                </span>
                                {teacher.department && <span className="text-[10px] text-slate-400">{teacher.department.name}</span>}
                              </div>
                            </label>
                          ))}
                          {teachers.length === 0 && (
                            <div className="text-sm text-slate-500 text-center py-4">O'qituvchilar topilmadi</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </form>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setIsResourceModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-sm"
              >
                Bekor qilish
              </button>
              <button 
                type="submit"
                form="resource-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saqlanmoqda...</>
                ) : (
                  <><Save className="w-4 h-4" /> Saqlash</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
