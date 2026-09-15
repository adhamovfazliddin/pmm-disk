"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, XCircle, FileText, Video, Presentation, FileArchive, File, ExternalLink, Loader2, User, Clock } from "lucide-react";
import { approveMaterial, rejectMaterial } from "@/app/actions/material";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import MaterialPreviewModal from "@/components/MaterialPreviewModal";

const FORMAT_ICONS = {
  PDF: <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 shadow-sm"><FileText className="w-6 h-6" /></div>,
  Video: <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm"><Video className="w-6 h-6" /></div>,
  Presentation: <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 shadow-sm"><Presentation className="w-6 h-6" /></div>,
  Archive: <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 shadow-sm"><FileArchive className="w-6 h-6" /></div>,
  Document: <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm"><File className="w-6 h-6" /></div>,
};

type Uploader = {
  name: string;
  email: string;
  department: { name: string } | null;
};

interface PendingMaterial {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  format: string;
  driveFileId: string;
  createdAt: Date;
  uploadedBy: Uploader | null;
}

export default function PendingMaterialsClient({ initialMaterials }: { initialMaterials: PendingMaterial[] }) {
  const router = useRouter();
  const [materials, setMaterials] = useState(initialMaterials);
  const [previewMaterial, setPreviewMaterial] = useState<PendingMaterial | null>(null);
  
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const res = await approveMaterial(id);
    setProcessingId(null);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Material tasdiqlandi!");
      setMaterials(materials.filter(m => m.id !== id));
      router.refresh();
    }
  };

  const handleRejectSubmit = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Iltimos, rad etish sababini kiriting");
      return;
    }
    
    setProcessingId(id);
    const res = await rejectMaterial(id, rejectReason);
    setProcessingId(null);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Material rad etildi!");
      setMaterials(materials.filter(m => m.id !== id));
      setIsRejecting(null);
      setRejectReason("");
      router.refresh();
    }
  };

  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hamma narsa joyida!</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          Ayni paytda tasdiqlashni kutayotgan materiallar yo'q. Barcha yuborilgan fayllar ko'rib chiqilgan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {materials.map(material => (
        <div key={material.id} className="group bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 dark:hover:border-blue-900/50">
          <div className="flex flex-col xl:flex-row gap-6">
            
            {/* Left side: Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 mt-1">
                  {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS]}
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                    {material.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-medium text-slate-500">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                      {material.subject}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> 
                      {format(new Date(material.createdAt), "dd MMM, yyyy HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
              
              {material.description && (
                <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50 mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {material.description}
                  </p>
                </div>
              )}
            </div>

            {/* Right side: Author */}
            <div className="xl:w-80 shrink-0">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/10 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/60 h-full flex flex-col justify-center">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Yuklagan shaxs</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
                    {material.uploadedBy?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {material.uploadedBy?.name || "Noma'lum foydalanuvchi"}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {material.uploadedBy?.department?.name || material.uploadedBy?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setPreviewMaterial(material)}
              className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-2.5 text-sm font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-600 rounded-xl transition-all duration-300"
            >
              <ExternalLink className="w-4 h-4" />
              Materialni ko'rish
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isRejecting === material.id ? (
                <div className="flex items-center gap-2 w-full transition-all">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Sababni yozing..."
                    autoFocus
                    className="flex-1 sm:w-64 px-4 py-2.5 text-sm rounded-xl border border-red-200 dark:border-red-900/50 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm outline-none transition-all"
                  />
                  <button
                    onClick={() => handleRejectSubmit(material.id)}
                    disabled={processingId === material.id}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-red-500/20 transition-all whitespace-nowrap"
                  >
                    {processingId === material.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Rad etish"}
                  </button>
                  <button
                    onClick={() => {
                      setIsRejecting(null);
                      setRejectReason("");
                    }}
                    disabled={processingId === material.id}
                    className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                  >
                    Bekor qilish
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsRejecting(material.id)}
                    disabled={processingId === material.id}
                    className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-2.5 text-sm font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 dark:bg-red-500/10 dark:hover:bg-red-600 rounded-xl transition-all duration-300"
                  >
                    <XCircle className="w-5 h-5" />
                    Rad etish
                  </button>
                  <button
                    onClick={() => handleApprove(material.id)}
                    disabled={processingId === material.id}
                    className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    {processingId === material.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    Tasdiqlash
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {previewMaterial && (
        <MaterialPreviewModal
          isOpen={!!previewMaterial}
          onClose={() => setPreviewMaterial(null)}
          material={previewMaterial as any}
        />
      )}
    </div>
  );
}
