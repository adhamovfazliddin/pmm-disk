"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, XCircle, FileText, Video, Presentation, FileArchive, File, ExternalLink, Loader2, User } from "lucide-react";
import { approveMaterial, rejectMaterial } from "@/app/actions/material";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import MaterialPreviewModal from "@/components/MaterialPreviewModal";

const FORMAT_ICONS = {
  PDF: <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"><FileText className="w-5 h-5" /></div>,
  Video: <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Video className="w-5 h-5" /></div>,
  Presentation: <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"><Presentation className="w-5 h-5" /></div>,
  Archive: <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400"><FileArchive className="w-5 h-5" /></div>,
  Document: <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"><File className="w-5 h-5" /></div>,
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
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Hamma narsa joyida</h3>
        <p className="mt-2 text-sm text-slate-500">
          Ayni paytda tasdiqlashni kutayotgan materiallar yo'q.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {materials.map(material => (
        <div key={material.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 transition-all hover:shadow-md">
          <div className="flex flex-col md:flex-row gap-5">
            
            <div className="flex-1">
              <div className="flex items-start gap-4">
                {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS]}
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                    {material.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span className="font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                      {material.subject}
                    </span>
                    <span>{format(new Date(material.createdAt), "dd.MM.yyyy HH:mm")}</span>
                  </div>
                  {material.description && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {material.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="md:w-64 shrink-0 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Yuklagan shaxs</h4>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {material.uploadedBy?.name || "Noma'lum"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {material.uploadedBy?.department?.name || material.uploadedBy?.email}
                  </p>
                </div>
              </div>
            </div>
            
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setPreviewMaterial(material)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Materialni ko'rish
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isRejecting === material.id ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Sababni yozing..."
                    className="flex-1 sm:w-64 px-3 py-2 text-sm rounded-lg border border-red-200 dark:border-red-900/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleRejectSubmit(material.id)}
                    disabled={processingId === material.id}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    {processingId === material.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tasdiqlash"}
                  </button>
                  <button
                    onClick={() => {
                      setIsRejecting(null);
                      setRejectReason("");
                    }}
                    disabled={processingId === material.id}
                    className="px-3 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Bekor qilish
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsRejecting(material.id)}
                    disabled={processingId === material.id}
                    className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Rad etish
                  </button>
                  <button
                    onClick={() => handleApprove(material.id)}
                    disabled={processingId === material.id}
                    className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm shadow-emerald-500/20 transition-all"
                  >
                    {processingId === material.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Tasdiqlash
                  </button>
                </>
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
