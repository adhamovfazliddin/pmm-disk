"use client";

import { FileText, Video, Presentation, FileArchive, File, Clock, CheckCircle2, XCircle, AlertCircle, LayoutGrid, List as ListIcon, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { deleteMaterial } from "@/app/actions/material";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MaterialPreviewModal from "@/components/MaterialPreviewModal";

const FORMAT_ICONS = {
  PDF: { icon: FileText, bg: "bg-red-50 dark:bg-red-500/10", color: "text-red-600 dark:text-red-400" },
  Video: { icon: Video, bg: "bg-indigo-50 dark:bg-indigo-500/10", color: "text-indigo-600 dark:text-indigo-400" },
  Presentation: { icon: Presentation, bg: "bg-orange-50 dark:bg-orange-500/10", color: "text-orange-600 dark:text-orange-400" },
  Archive: { icon: FileArchive, bg: "bg-slate-100 dark:bg-slate-500/10", color: "text-slate-600 dark:text-slate-400" },
  Document: { icon: File, bg: "bg-blue-50 dark:bg-blue-500/10", color: "text-blue-600 dark:text-blue-400" },
};

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    label: "Kutilmoqda",
    classes: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20"
  },
  APPROVED: {
    icon: CheckCircle2,
    label: "Tasdiqlandi",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
  },
  REJECTED: {
    icon: XCircle,
    label: "Rad etildi",
    classes: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
  }
};

interface MyMaterial {
  id: string;
  title: string;
  description: string | null;
  format: string;
  driveFileId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  createdAt: Date;
}

export default function MyMaterialsClient({ initialMaterials }: { initialMaterials: MyMaterial[] }) {
  const router = useRouter();
  const [materials, setMaterials] = useState(initialMaterials);
  const [previewMaterial, setPreviewMaterial] = useState<MyMaterial | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleDelete = async (id: string) => {
    if (!confirm("Rostdan ham ushbu materialni o'chirmoqchimisiz?")) return;
    
    const res = await deleteMaterial(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Material o'chirildi");
      setMaterials(materials.filter(m => m.id !== id));
      router.refresh();
    }
  };

  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-5 shadow-inner">
          <FileText className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Siz hali material yuklamagansiz</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          O'quvchilar va boshqa ustozlar bilan o'z bilimingizni ulashing! "Material qo'shish" orqali birinchi faylingizni yuklang.
        </p>
        <button
          onClick={() => router.push("/dashboard/materials/new")}
          className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/30 hover:scale-105"
        >
          Birinchi materialni qo'shish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material, index) => {
            const statusCfg = STATUS_CONFIG[material.status];
            const StatusIcon = statusCfg.icon;
            const formatStyle = FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS] || FORMAT_ICONS.Document;
            const FormatIcon = formatStyle.icon;

            return (
              <div key={material.id} className="backdrop-blur-md bg-white/90 dark:bg-[#111827]/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full group">
                
                {/* Thumbnail Section */}
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
                  {material.driveFileId ? (
                    <>
                      <img 
                        src={`https://drive.google.com/thumbnail?id=${material.driveFileId}&sz=w800`} 
                        alt={material.title} 
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" 
                        referrerPolicy="no-referrer" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 flex-col items-center justify-center text-slate-400 opacity-60" style={{ display: 'none' }}>
                        <FormatIcon className="w-12 h-12 mb-2" />
                        <span className="text-xs font-medium uppercase tracking-wider">{material.format}</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60">
                      <FormatIcon className="w-12 h-12 mb-2" />
                      <span className="text-xs font-medium uppercase tracking-wider">{material.format}</span>
                    </div>
                  )}

                  {/* Status Badge overlay */}
                  <div className="absolute top-3 right-3">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm border ${
                      material.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/90 dark:text-white dark:border-emerald-600' : 
                      material.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-500/90 dark:text-white dark:border-rose-600' : 
                      'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/90 dark:text-white dark:border-amber-600'
                    }`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusCfg.label}
                    </div>
                  </div>

                  {/* Format Badge overlay */}
                  <div className="absolute bottom-3 left-3">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase shadow-sm border bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm ${formatStyle.color} ${formatStyle.bg.split(' ')[0]} dark:border-slate-700`}>
                      <FormatIcon className="w-3.5 h-3.5" />
                      {material.format}
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors" title={material.title}>
                    {material.title}
                  </h3>
                  
                  {material.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                      {material.description}
                    </p>
                  )}

                  {material.status === "REJECTED" && material.rejectionReason && (
                    <div className="mt-2 mb-4 bg-red-50/80 dark:bg-red-500/10 p-3 rounded-xl border border-red-100/80 dark:border-red-500/20">
                      <div className="flex gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] font-bold text-red-800 dark:text-red-300 uppercase tracking-wider block mb-0.5">Rad etish sababi</span>
                          <p className="text-xs text-red-700 dark:text-red-400 leading-snug">{material.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between mt-auto transition-colors">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5 opacity-70" />
                    {format(new Date(material.createdAt), "dd MMM, yyyy")}
                  </div>
                  
                  <div className="flex justify-end gap-1.5 opacity-100">
                    <button 
                      onClick={() => setPreviewMaterial(material)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                      title="Ko'rish"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(material.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">№</th>
                  <th className="px-6 py-4">Sarlavha (Fayl nomi)</th>
                  <th className="px-6 py-4">Format / Turi</th>
                  <th className="px-6 py-4">Holat</th>
                  <th className="px-6 py-4">Sana / Qo'shilgan vaqti</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {materials.map((material, index) => {
                  const statusCfg = STATUS_CONFIG[material.status];
                  const StatusIcon = statusCfg.icon;
                  const formatStyle = FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS] || FORMAT_ICONS.Document;
                  const FormatIcon = formatStyle.icon;

                  return (
                    <tr key={material.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 text-center font-medium text-slate-400 dark:text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white max-w-[300px] truncate group-hover:text-blue-600 transition-colors">
                            {material.title}
                          </span>
                          {material.description && (
                            <span className="text-xs text-slate-500 mt-1 max-w-[300px] truncate">
                              {material.description}
                            </span>
                          )}
                          {material.status === "REJECTED" && material.rejectionReason && (
                            <span className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Sabab: {material.rejectionReason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${formatStyle.bg} ${formatStyle.color}`}>
                          <FormatIcon className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {material.format === "Document" ? "Word" : 
                             material.format === "Presentation" ? "Taqdimot" : 
                             material.format === "Archive" ? "Arxiv" : 
                             material.format === "Video" ? "Video" : 
                             material.format}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-wide uppercase ${statusCfg.classes}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusCfg.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                        {format(new Date(material.createdAt), "dd.MM.yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setPreviewMaterial(material)}
                            className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-colors"
                            title="Ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(material.id)}
                            className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MaterialPreviewModal 
        isOpen={!!previewMaterial}
        onClose={() => setPreviewMaterial(null)}
        material={previewMaterial as any}
      />
    </div>
  );
}
