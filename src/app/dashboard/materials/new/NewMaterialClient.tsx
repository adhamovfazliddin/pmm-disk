"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMaterial } from "@/app/actions/material";
import { toast } from "sonner";
import { FileText, Link as LinkIcon, Loader2, Video, Presentation, FileArchive, File, Type, AlignLeft } from "lucide-react";

const FORMAT_OPTIONS = [
  { id: "PDF", label: "PDF Hujjat", icon: FileText, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/20" },
  { id: "Document", label: "Word (DOCX)", icon: File, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20" },
  { id: "Presentation", label: "Taqdimot", icon: Presentation, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-200 dark:border-orange-500/20" },
  { id: "Video", label: "Video Darslik", icon: Video, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-200 dark:border-indigo-500/20" },
  { id: "Archive", label: "Arxiv (ZIP)", icon: FileArchive, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-500/10", border: "border-slate-200 dark:border-slate-500/20" },
];

export default function NewMaterialClient() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("PDF");
  const [driveUrl, setDriveUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    const result = await createMaterial({
      title,
      description,
      format,
      driveUrl,
    });

    setIsSubmitting(false);

    if (result.error) {
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      } else {
        toast.error(result.error);
      }
    } else {
      toast.success("Material yuborildi! Admin tasdiqlashini kuting.");
      router.push("/dashboard/my-materials");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Material nomi *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Type className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
                placeholder="Masalan: 1-mavzu Taqdimoti"
              />
            </div>
            {fieldErrors.title && <p className="text-xs text-red-500 mt-1.5 ml-1">{fieldErrors.title[0]}</p>}
          </div>

          {/* Drive URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Google Drive Havolasi *</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                <LinkIcon className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="url" 
                required
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
                placeholder="https://drive.google.com/file/d/.../view"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 ml-1 flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30 w-fit">
              <FileText className="w-3.5 h-3.5" /> Faylga ruxsat <b>"Hammaga ko'rishga ruxsat berish"</b> qilib sozlanganligiga ishonch hosil qiling.
            </p>
            {fieldErrors.driveUrl && <p className="text-xs text-red-500 mt-1.5 ml-1">{fieldErrors.driveUrl[0]}</p>}
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Qisqacha tavsif (ixtiyoriy)</label>
            <div className="relative">
              <div className="absolute top-3.5 left-4 pointer-events-none">
                <AlignLeft className="h-5 w-5 text-slate-400" />
              </div>
              <textarea 
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm resize-none"
                placeholder="Ushbu material haqida ma'lumot qoldiring..."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Format Selection */}
        <div className="lg:col-span-5 space-y-3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Fayl formati *</label>
          <div className="grid grid-cols-2 gap-3 h-[calc(100%-28px)]">
            {FORMAT_OPTIONS.map((opt, index) => {
              const isSelected = format === opt.id;
              const Icon = opt.icon;
              // Make the last item span 2 columns to center it nicely
              const isLast = index === FORMAT_OPTIONS.length - 1;
              return (
                <div 
                  key={opt.id}
                  onClick={() => setFormat(opt.id)}
                  className={`cursor-pointer flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${isLast ? "col-span-2" : ""} ${
                    isSelected 
                      ? `${opt.border} bg-white dark:bg-slate-800 shadow-md scale-[1.02]` 
                      : `border-transparent ${opt.bg} hover:bg-slate-100 dark:hover:bg-slate-800/80 opacity-70 hover:opacity-100`
                  }`}
                >
                  <Icon className={`w-8 h-8 ${isSelected ? opt.color : "text-slate-500 dark:text-slate-400"}`} />
                  <span className={`text-sm font-semibold text-center ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          Bekor qilish
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !driveUrl.trim()}
          className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px] transition-all shadow-sm shadow-blue-500/30"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yuborish"}
        </button>
      </div>
    </form>
  );
}
