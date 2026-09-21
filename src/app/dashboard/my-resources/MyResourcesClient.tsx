"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X, Loader2, ExternalLink, Link2, Video, Globe, Film, Type, Tags, AlignLeft, Layers, PlayCircle } from "lucide-react";
import { addPersonalResource, updatePersonalResource, deletePersonalResource } from "@/app/actions/personalResource";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n";

type PersonalResource = {
  id: string;
  title: string;
  url: string;
  type: string;
  category: string | null;
  description: string | null;
  createdAt: Date;
};

const EMPTY_FORM = { title: "", url: "", type: "link", category: "", description: "" };

export default function MyResourcesClient({ initialResources }: { initialResources: PersonalResource[] }) {
  const { t } = useLanguage();
  const [resources, setResources] = useState<PersonalResource[]>(initialResources);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<PersonalResource | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setIsModalOpen(true); };
  const openEdit = (r: PersonalResource) => {
    setEditing(r);
    setForm({ title: r.title, url: r.url, type: r.type, category: r.category || "", description: r.description || "" });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim()) { toast.error("Sarlavha va URL majburiy"); return; }
    setLoading(true);
    try {
      if (editing) {
        const res = await updatePersonalResource(editing.id, form);
        if (res.error) { toast.error(res.error); return; }
        setResources(prev => prev.map(r => r.id === editing.id ? { ...r, ...form } : r));
        toast.success("Resurs yangilandi");
      } else {
        const res = await addPersonalResource(form);
        if (res.error) { toast.error(res.error); return; }
        setResources(prev => [...prev, res.resource as PersonalResource]);
        toast.success("Resurs qo'shildi");
      }
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu resursni o'chirmoqchimisiz?")) return;
    const res = await deletePersonalResource(id);
    if (res.success) { setResources(prev => prev.filter(r => r.id !== id)); toast.success("O'chirildi"); }
    else toast.error(res.error);
  };

  const filtered = resources.filter(r => {
    const matchType = filterType === "ALL" || r.type === filterType;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || (r.category || "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Link2 className="w-6 h-6 text-blue-500" />
            {t('myResourcesTitle') || "Mening Resurslarim"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('myResourcesDesc') || "O'zingizning video darslar va foydali havolalaringiz"}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-5 py-2.5 rounded-xl shadow transition-all"
        >
          <Plus className="w-4 h-4" /> {t('add') || "+ Qo'shish"}
        </button>
      </div>

      {/* Filter & Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80">
        <input
          type="text"
          placeholder={t('search') || "Qidirish..."}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          {[{ v: "ALL", l: t('all') || "Barchasi" }, { v: "video", l: "🎬 " + (t('videoLessons') || "Video Darslar") }, { v: "link", l: "🌐 " + (t('usefulLinks') || "Foydali Linklar") }].map(opt => (
            <button
              key={opt.v}
              onClick={() => setFilterType(opt.v)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${filterType === opt.v ? "bg-blue-500 text-white border-blue-500 shadow" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}
            >
              {opt.l}
            </button>
          ))}
        </div>
        <span className="self-center text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {filtered.length} ta resurs
        </span>
      </div>

      {/* Resources Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/60 dark:bg-[#111827]/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <span className="text-5xl mb-4">📎</span>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">Resurs topilmadi</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Yangi resurs qo&apos;shish uchun yuqoridagi tugmani bosing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((res, index) => (
            <div key={res.id} className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                    #{index + 1}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${res.type === "video" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"}`}>
                    {res.type === "video" ? <PlayCircle className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
                    {res.type === "video" ? "Video Dars" : "Foydali Link"}
                  </span>
                  {res.category && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      {res.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => openEdit(res)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Tahrirlash">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(res.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="O'chirish">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-white leading-snug line-clamp-2">{res.title}</h4>
              {res.description && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{res.description}</p>}
              <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-2">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium truncate"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{res.url}</span>
                </a>
                <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                  {new Date(res.createdAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${editing ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                  {editing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editing ? (t('edit') || "Resursni tahrirlash") : (t('newResource') || "Yangi resurs qo'shish")}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Type Selection */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" /> {t('resourceType') || "Resurs turi *"}
                </label>
                <div className="flex gap-4">
                  {[{ v: "link", l: t('websiteLink') || "Veb-sayt / Link", icon: Globe }, { v: "video", l: t('videoLesson') || "Video Dars", icon: PlayCircle }].map(opt => {
                    const Icon = opt.icon;
                    const isActive = form.type === opt.v;
                    return (
                      <button key={opt.v} type="button" onClick={() => setForm(f => ({ ...f, type: opt.v }))}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-all ${isActive ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"}`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} /> {opt.l}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <Type className="w-4 h-4 text-blue-500" /> {t('title') || "Sarlavha *"}
                  </label>
                  <input type="text" placeholder="Masalan: React darslari to'plami" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-blue-500" /> {t('linkUrl') || "Havola (URL) *"}
                  </label>
                  <input type="url" placeholder="https://..." value={form.url}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <Tags className="w-4 h-4 text-blue-500" /> Kategoriya
                  </label>
                  <input type="text" placeholder="Masalan: Matematika, Fizika..." value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-blue-500" /> {t('description') || "Tavsif (ixtiyoriy)"}
                  </label>
                  <input type="text" placeholder="Qisqacha tavsif..." value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <button onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                {t('cancel') || "Bekor qilish"}
              </button>
              <button disabled={loading} onClick={handleSave}
                className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? (t('save') || "Saqlash") : (t('add') || "+ Qo'shish")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
