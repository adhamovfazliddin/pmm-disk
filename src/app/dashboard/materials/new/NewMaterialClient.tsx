"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMaterial } from "@/app/actions/material";
import { toast } from "sonner";
import { FileText, Link as LinkIcon, Loader2 } from "lucide-react";

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
      // subject & visibility are handled by server action defaults for teachers
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Material nomi *</label>
          <input 
            type="text" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Masalan: 1-mavzu Taqdimoti"
          />
          {fieldErrors.title && <p className="text-xs text-red-500 mt-1">{fieldErrors.title[0]}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Google Drive Havolasi *</label>
          <div className="relative">
            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="url" 
              required
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="https://drive.google.com/file/d/.../view"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Faylga ruxsat <b>"Hammaga ko'rishga ruxsat berish"</b> qilib sozlanganligiga ishonch hosil qiling.
          </p>
          {fieldErrors.driveUrl && <p className="text-xs text-red-500 mt-1">{fieldErrors.driveUrl[0]}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Format *</label>
          <select 
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="PDF">PDF Hujjat</option>
            <option value="Document">Word Hujjat (DOCX)</option>
            <option value="Presentation">Taqdimot (PPTX)</option>
            <option value="Video">Video Darslik</option>
            <option value="Archive">Arxiv (ZIP/RAR)</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Qisqacha tavsif (ixtiyoriy)</label>
          <textarea 
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            placeholder="Ushbu material haqida ma'lumot qoldiring..."
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Bekor qilish
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !driveUrl.trim()}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px] transition-all shadow-sm shadow-blue-500/20"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yuborish"}
        </button>
      </div>
    </form>
  );
}
