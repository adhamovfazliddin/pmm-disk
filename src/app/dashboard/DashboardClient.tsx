"use client";

import { useState, useEffect } from "react";
import { Search, FileText, Video, Presentation, FileArchive, File, ExternalLink, Calendar, Download, LayoutGrid, List, Star } from "lucide-react";
import { getDrivePreviewUrl } from "@/lib/drive";
import { useLanguage } from "@/lib/i18n";
import { recordMaterialActivity } from "@/app/actions/analytics";
import MaterialPreviewModal from "@/components/MaterialPreviewModal";
import { toast } from "sonner";

const FORMAT_ICONS = {
  PDF: <FileText className="w-5 h-5 text-red-500" />,
  Video: <Video className="w-5 h-5 text-purple-500" />,
  Presentation: <Presentation className="w-5 h-5 text-orange-500" />,
  Archive: <FileArchive className="w-5 h-5 text-indigo-500" />,
  Document: <File className="w-5 h-5 text-blue-600" />,
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<"drive" | "platform">(driveFolderId ? "drive" : "platform");

  useEffect(() => {
    const savedMode = localStorage.getItem('materials_view_mode');
    if (savedMode === 'grid' || savedMode === 'list') {
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

  const handleViewModeChange = (mode: "grid" | "list") => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white/90 dark:bg-slate-900/80 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80">
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
        <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
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

      {/* Google Drive Folder Embed (Tab 1) */}
      {driveFolderId && activeTab === "drive" && (
        <div className="h-[750px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-950">
          <iframe 
            src={getDriveFolderEmbedUrl(driveFolderId) || ""} 
            width="100%" 
            height="100%" 
            className="w-full h-full border-none"
            title="Google Drive Folder"
            allow="autoplay"
          ></iframe>
        </div>
      )}

      {/* Platform Materials (Tab 2) */}
      {(!driveFolderId || activeTab === "platform") && (
        <>
          {/* Filters */}
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
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center justify-between w-full md:w-auto">
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5 ${
                showBookmarksOnly
                  ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
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
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                {fmt.label}
              </button>
            ))}
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

      {/* Materials */}
      {filteredMaterials.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 transition-colors">
          <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('noMaterialsDashboard')}</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            Tizimda ushbu qidiruv bo'yicha materiallar topilmadi. Boshqa kalit so'z yoki formatni tanlab ko'ring.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors">
                      {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS] || <File className="w-5 h-5 text-gray-500" />}
                    </div>
                    <button 
                      onClick={() => toggleBookmark(material.id)}
                      className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all"
                      title="Saqlash / Olib tashlash"
                    >
                      <Star className={`w-5 h-5 transition-transform ${bookmarkedIds.includes(material.id) ? 'fill-amber-400 text-amber-500 scale-110' : ''}`} />
                    </button>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800 transition-colors">
                    {material.subject}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2" title={material.title}>
                  {material.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 transition-colors">{material.description || ""}</p>
              </div>

              <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-3 mt-auto transition-colors">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(material.createdAt).toLocaleDateString()}
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
        <div className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-700/50">
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Sarlavha</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Turkum</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Format</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Sana</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Harakatlar</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                          {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS] || <File className="w-4 h-4 text-gray-500" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{material.title}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{material.description || ""}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800 transition-colors">
                        {material.subject}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{material.format}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(material.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 flex gap-2 justify-end">
                      <button
                        onClick={() => toggleBookmark(material.id)}
                        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                        title="Saqlash / Olib tashlash"
                      >
                        <Star className={`w-4 h-4 transition-transform ${bookmarkedIds.includes(material.id) ? 'fill-amber-400 text-amber-500 scale-110' : ''}`} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMaterial(material);
                          setIsPreviewOpen(true);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title={t('preview')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://drive.google.com/uc?export=download&id=${material.driveFileId}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => recordMaterialActivity(material.id, 'DOWNLOAD')}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title={t('download')}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
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
