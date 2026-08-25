"use client";

import { useState, useEffect } from "react";
import { Search, FileText, Video, Presentation, FileArchive, File, ExternalLink, Calendar, Download, LayoutGrid, List, Table, Star, BookOpen, Eye, Folder } from "lucide-react";
import { getDrivePreviewUrl } from "@/lib/drive";
import { useLanguage } from "@/lib/i18n";
import { recordMaterialActivity } from "@/app/actions/analytics";
import { fetchDriveFiles, DriveFile } from "@/app/actions/drive";
import MaterialPreviewModal from "@/components/MaterialPreviewModal";
import { toast } from "sonner";

const FORMAT_ICONS = {
  PDF: <div className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg shrink-0"><FileText className="w-5 h-5" /></div>,
  Video: <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg shrink-0"><Video className="w-5 h-5" /></div>,
  Presentation: <div className="p-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg shrink-0"><Presentation className="w-5 h-5" /></div>,
  Archive: <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0"><FileArchive className="w-5 h-5" /></div>,
  Document: <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg shrink-0"><File className="w-5 h-5" /></div>,
  Folder: <div className="p-2 bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-lg shrink-0"><Folder className="w-5 h-5 fill-slate-200 dark:fill-slate-700" /></div>,
};

const FormatBadge = ({ format }: { format: string }) => {
  const colors: Record<string, string> = {
    PDF: "bg-red-50 text-red-600 border-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    Document: "bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    Presentation: "bg-orange-50 text-orange-600 border-orange-200/60 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
    Video: "bg-purple-50 text-purple-600 border-purple-200/60 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
    Archive: "bg-indigo-50 text-indigo-600 border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
    Folder: "bg-slate-100 text-slate-600 border-slate-200/60 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
  };
  const colorClass = colors[format] || "bg-slate-50 text-slate-600 border-slate-200/60 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
  return <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md border ${colorClass}`}>{format}</span>;
};

interface Material {
  id: string;
  title: string;
  description?: string | null;
  subject: string;
  format: string;
  driveFileId: string;
  createdAt: Date;
}

export function getDriveFolderEmbedUrl(urlOrId: string | null | undefined): string | null {
  if (!urlOrId) return null;
  // Match folder ID from standard sharing URL or raw ID
  const match = urlOrId.match(/folders\/([a-zA-Z0-9_-]+)/) || urlOrId.match(/^([a-zA-Z0-9_-]+)$/);
  const folderId = match ? match[1] : urlOrId;
  return `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
}

export const getFullDriveUrl = (urlOrId?: string | null) => {
  if (!urlOrId) return "https://drive.google.com";
  if (urlOrId.startsWith("http")) return urlOrId;
  return `https://drive.google.com/drive/folders/${urlOrId}`;
};

export default function DashboardClient({ 
  initialMaterials, 
  sessionName,
  description,
  driveFolderId
}: { 
  initialMaterials: Material[], 
  sessionName: string,
  description?: string | null,
  driveFolderId?: string | null
}) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [formatFilter, setFormatFilter] = useState("ALL");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<"drive" | "platform">(driveFolderId ? "drive" : "platform");
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveError, setDriveError] = useState("");

  useEffect(() => {
    if (driveFolderId && activeTab === "drive" && driveFiles.length === 0) {
      const loadDriveFiles = async () => {
        setIsLoadingDrive(true);
        try {
          const folderId = driveFolderId.match(/folders\/([a-zA-Z0-9_-]+)/)?.[1] || driveFolderId;
          const files = await fetchDriveFiles(folderId);
          setDriveFiles(files);
        } catch (error) {
          console.error(error);
          setDriveError("Fayllarni yuklashda xatolik yuz berdi");
        } finally {
          setIsLoadingDrive(false);
        }
      };
      loadDriveFiles();
    }
  }, [driveFolderId, activeTab]);

  useEffect(() => {
    const savedMode = localStorage.getItem('materials_view_mode');
    if (savedMode === 'grid' || savedMode === 'table') {
      setViewMode(savedMode);
    }
    const savedBookmarks = localStorage.getItem('teacher_bookmarked_ids');
    if (savedBookmarks) {
      try {
        setBookmarkedIds(JSON.parse(savedBookmarks));
      } catch (e) {}
    }
  }, []);

  const toggleBookmark = (id: string) => {
    let newBookmarks;
    if (bookmarkedIds.includes(id)) {
      newBookmarks = bookmarkedIds.filter(bId => bId !== id);
      toast.success("Olib tashlandi");
    } else {
      newBookmarks = [...bookmarkedIds, id];
      toast.success("Saqlandi");
    }
    setBookmarkedIds(newBookmarks);
    localStorage.setItem('teacher_bookmarked_ids', JSON.stringify(newBookmarks));
  };

  const handleViewModeChange = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem('materials_view_mode', mode);
  };

  const filteredMaterials = initialMaterials.filter((material) => {
    if (showBookmarksOnly && !bookmarkedIds.includes(material.id)) return false;
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = formatFilter === "ALL" || material.format === formatFilter;
    return matchesSearch && matchesFormat;
  });

  const mappedDriveFiles = driveFiles.map(file => {
    let format = "Document";
    const mime = (file.mimeType || "").toLowerCase();
    if (mime.includes("pdf")) format = "PDF";
    else if (mime.includes("video") || mime.includes("mp4")) format = "Video";
    else if (mime.includes("presentation") || mime.includes("powerpoint")) format = "Presentation";
    else if (mime.includes("zip") || mime.includes("rar") || mime.includes("archive")) format = "Archive";
    else if (mime.includes("folder")) format = "Folder";

    return {
      id: file.id,
      title: file.name,
      description: "",
      subject: "Google Drive",
      format,
      driveFileId: file.id,
      createdAt: file.modifiedTime ? new Date(file.modifiedTime) : new Date(),
      isDriveFile: true,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink
    };
  });

  const displayMaterials = activeTab === "platform" 
    ? filteredMaterials 
    : mappedDriveFiles.filter((material) => {
        const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFormat = formatFilter === "ALL" || material.format === formatFilter;
        return matchesSearch && matchesFormat;
      });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white/90 dark:bg-[#111827]/90 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t('departmentDashboardTitle') || "Kafedra Boshqaruv Paneli"}</h1>
          <p className="text-blue-600 dark:text-blue-400 mt-1 text-xl font-medium">{sessionName}</p>
          {description && <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-3xl leading-relaxed">{description}</p>}
        </div>
        {driveFolderId && (
          <div className="shrink-0 pt-2">
            <a 
              href={getFullDriveUrl(driveFolderId)}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 font-medium cursor-pointer"
            >
              <ExternalLink className="w-5 h-5" /> {t('openInDrive') || "Google Drive orqali ochish"}
            </a>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      {driveFolderId && (
        <div className="flex bg-slate-100/50 dark:bg-[#1E293B]/60 p-1 rounded-xl w-fit border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <button
            onClick={() => setActiveTab("drive")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "drive"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            📁 Kafedra Drive Jildi
          </button>
          <button
            onClick={() => setActiveTab("platform")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "platform"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            📚 Platforma Materiallari
          </button>
        </div>
      )}

      {/* Platform Materials & Drive Materials (Unified UI) */}
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
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center justify-between w-full md:w-auto">
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5 ${
                showBookmarksOnly
                  ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50'
                  : 'bg-slate-50 dark:bg-[#1E293B]/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Star className={`w-4 h-4 transition-transform ${showBookmarksOnly ? 'fill-current scale-110 text-amber-500' : ''}`} /> Tanlanganlar
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
            {[
              { value: "ALL", label: t('allFormats') },
              { value: "PDF", label: "PDF" },
              { value: "Video", label: "Video" },
              { value: "Presentation", label: "Presentation" },
              { value: "Document", label: "Document" },
              { value: "Archive", label: "Archive" },
            ].map(fmt => (
              <button
                key={fmt.value}
                onClick={() => setFormatFilter(fmt.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${formatFilter === fmt.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-[#1E293B]/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                {fmt.label}
              </button>
            ))}
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
              onClick={() => handleViewModeChange('table')}
              title="Jadval ko'rinishi / Таблица"
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Materials */}
      {isLoadingDrive ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Fayllar yuklanmoqda...</h3>
        </div>
      ) : driveError ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-red-50 dark:bg-red-900/10 backdrop-blur-md rounded-2xl border border-red-200 dark:border-red-800/30">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">{driveError}</h3>
        </div>
      ) : displayMaterials.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 transition-colors">
          <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-[#1E293B]/60 flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('noMaterialsDashboard')}</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            Tizimda ushbu qidiruv bo'yicha materiallar topilmadi. Boshqa kalit so'z yoki formatni tanlab ko'ring.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayMaterials.map((material) => (
            <div key={material.id} className="backdrop-blur-md bg-white/90 dark:bg-[#111827]/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS] || <div className="p-2 bg-slate-100 dark:bg-[#1E293B]/60 rounded-lg shrink-0"><File className="w-5 h-5 text-gray-500" /></div>}
                    <button 
                      onClick={() => toggleBookmark(material.id)}
                      className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all ml-auto"
                      title="Saqlash / Olib tashlash"
                    >
                      <Star className={`w-5 h-5 transition-transform ${bookmarkedIds.includes(material.id) ? 'fill-amber-400 text-amber-500 scale-110' : ''}`} />
                    </button>
                  </div>
                  <span className="flex w-max items-center gap-1.5 px-2.5 py-1 mt-1.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-[#1E293B]/60 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors">
                    <BookOpen className="w-3.5 h-3.5" /> {material.subject}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2" title={material.title}>
                  {material.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 transition-colors">{material.description || ""}</p>
              </div>

              <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-3 mt-auto transition-colors">
                <div className="flex justify-between items-center w-full">
                  <FormatBadge format={material.format} />
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(material.createdAt).toLocaleDateString("ru-RU", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedMaterial(material);
                      setIsPreviewOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 px-3 py-2 rounded-md transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> {t('preview')}
                  </button>
                  <a
                    href={`https://drive.google.com/uc?export=download&id=${material.driveFileId}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => recordMaterialActivity(material.id, 'DOWNLOAD')}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 px-3 py-2 rounded-md transition-colors"
                  >
                    <Download className="w-4 h-4" /> {t('download')}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="backdrop-blur-md bg-white/90 dark:bg-[#111827]/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-700/50">
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 w-12 text-center">№</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Sarlavha (Fayl nomi)</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Turkum / Kafedra</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Format / Turi</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Sana / Qo'shilgan vaqti</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {displayMaterials.map((material, index) => (
                  <tr key={material.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group">
                    <td className="p-4 text-center font-medium text-slate-500">{index + 1}</td>
                    <td className="p-4 align-middle font-medium text-slate-900 dark:text-slate-100 max-w-xs">
                      <div className="flex items-center gap-3">
                        {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS] || <div className="p-2 bg-slate-100 dark:bg-[#1E293B]/60 rounded-lg shrink-0"><File className="w-5 h-5 text-gray-500" /></div>}
                        <div className="flex flex-col min-w-0 gap-0.5">
                          <span className="truncate font-semibold text-gray-900 dark:text-white">{material.title}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{material.description || ""}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="flex items-center gap-1.5 w-max px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-[#1E293B]/60 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                        <BookOpen className="w-3.5 h-3.5" /> {material.subject}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <FormatBadge format={material.format} />
                    </td>
                    <td className="p-4 align-middle">
                      <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(material.createdAt).toLocaleDateString("ru-RU", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-1.5 opacity-100">
                        <button
                          onClick={() => toggleBookmark(material.id)}
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-all"
                          title="Saqlash / Olib tashlash"
                        >
                          <Star className={`w-4 h-4 transition-transform ${bookmarkedIds.includes(material.id) ? 'fill-amber-400 text-amber-500 scale-110' : ''}`} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMaterial(material);
                            setIsPreviewOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                          title={t('preview')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://drive.google.com/uc?export=download&id=${material.driveFileId}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => recordMaterialActivity(material.id, 'DOWNLOAD')}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
                          title={t('download')}
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MaterialPreviewModal
        material={selectedMaterial}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          // Small delay before clearing data so exit animation has time
          setTimeout(() => setSelectedMaterial(null), 300);
        }}
      />
    </div>
  );
}
