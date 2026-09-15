"use client";

import { FileText, Video, Presentation, FileArchive, File, Clock, CheckCircle2, XCircle, Trash2, Edit2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { deleteMaterial } from "@/app/actions/material";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MaterialPreviewModal from "@/components/MaterialPreviewModal";

const FORMAT_ICONS = {
  PDF: <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"><FileText className="w-5 h-5" /></div>,
  Video: <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Video className="w-5 h-5" /></div>,
  Presentation: <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"><Presentation className="w-5 h-5" /></div>,
  Archive: <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400"><FileArchive className="w-5 h-5" /></div>,
  Document: <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"><File className="w-5 h-5" /></div>,
};

const STATUS_CONFIG = {
  PENDING: {
    icon: <Clock className="w-4 h-4" />,
    label: "Kutilmoqda",
    classes: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20"
  },
  APPROVED: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Tasdiqlandi",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
  },
  REJECTED: {
    icon: <XCircle className="w-4 h-4" />,
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

  const handleDelete = async (id: string) => {
    if (!confirm("Rostdan ham ushbu materialni o'chirmoqchimisiz?")) return;
    
    // We update UI optimistically, or wait. Waiting is safer.
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
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Siz hali material yuklamagansiz</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
          "Material qo'shish" tugmasini bosib o'z qo'llanmalaringizni yuklashingiz mumkin.
        </p>
        <button
          onClick={() => router.push("/dashboard/materials/new")}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Birinchi materialni qo'shish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {materials.map(material => {
        const statusCfg = STATUS_CONFIG[material.status];
        
        return (
          <div key={material.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS]}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                      {material.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {format(new Date(material.createdAt), "dd.MM.yyyy HH:mm")}
                    </p>
                  </div>
                  
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${statusCfg.classes}`}>
                    {statusCfg.icon}
                    {statusCfg.label}
                  </div>
                </div>

                {material.description && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {material.description}
                  </p>
                )}

                {material.status === "REJECTED" && material.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20 flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Rad etish sababi:</h4>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">{material.rejectionReason}</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <button 
                    onClick={() => setPreviewMaterial(material)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    Ko'rish
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(material.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 rounded-lg transition-colors ml-auto"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

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
