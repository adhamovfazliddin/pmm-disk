"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, XCircle, FileText, Video, Presentation, FileArchive, File, ExternalLink, Loader2, User, CheckSquare } from "lucide-react";
import { approveMaterial, rejectMaterial } from "@/app/actions/material";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import MaterialPreviewModal from "@/components/MaterialPreviewModal";
import { useLanguage } from "@/lib/i18n";

const FORMAT_ICONS = {
  PDF: <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 shadow-sm border border-red-100 dark:border-red-900/30"><FileText className="w-4 h-4" /></div>,
  Video: <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/30"><Video className="w-4 h-4" /></div>,
  Presentation: <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 shadow-sm border border-orange-100 dark:border-orange-900/30"><Presentation className="w-4 h-4" /></div>,
  Archive: <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-800"><FileArchive className="w-4 h-4" /></div>,
  Document: <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/30"><File className="w-4 h-4" /></div>,
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
  const { t } = useLanguage();
  const [materials, setMaterials] = useState(initialMaterials);
  const [previewMaterial, setPreviewMaterial] = useState<PendingMaterial | null>(null);
  
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [isBulkRejectingInput, setIsBulkRejectingInput] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [isBulkRejecting, setIsBulkRejecting] = useState(false);

  const toggleAll = () => {
    if (selectedIds.length === materials.length) {
      setSelectedIds([]);
      setIsBulkRejectingInput(false);
    } else {
      setSelectedIds(materials.map(m => m.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
      if (selectedIds.length === 1) setIsBulkRejectingInput(false);
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkApproving(true);
    
    try {
      const promises = selectedIds.map(id => approveMaterial(id));
      const results = await Promise.all(promises);
      
      const successfulIds = selectedIds.filter((_, i) => !results[i].error);
      const failedCount = results.filter(r => r.error).length;
      
      if (successfulIds.length > 0) {
        toast.success(`${successfulIds.length} ta material tasdiqlandi!`);
        setMaterials(prev => prev.filter(m => !successfulIds.includes(m.id)));
        setSelectedIds([]);
        setIsBulkRejectingInput(false);
      }
      
      if (failedCount > 0) {
        toast.error(`${failedCount} ta materialni tasdiqlashda xatolik yuz berdi.`);
      }
      
      router.refresh();
    } catch (e) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsBulkApproving(false);
    }
  };

  const handleBulkRejectSubmit = async () => {
    if (!bulkRejectReason.trim()) {
      toast.error("Iltimos, rad etish sababini kiriting");
      return;
    }
    if (selectedIds.length === 0) return;
    
    setIsBulkRejecting(true);
    
    try {
      const promises = selectedIds.map(id => rejectMaterial(id, bulkRejectReason));
      const results = await Promise.all(promises);
      
      const successfulIds = selectedIds.filter((_, i) => !results[i].error);
      const failedCount = results.filter(r => r.error).length;
      
      if (successfulIds.length > 0) {
        toast.success(`${successfulIds.length} ta material rad etildi!`);
        setMaterials(prev => prev.filter(m => !successfulIds.includes(m.id)));
        setSelectedIds([]);
        setIsBulkRejectingInput(false);
        setBulkRejectReason("");
      }
      
      if (failedCount > 0) {
        toast.error(`${failedCount} ta materialni rad etishda xatolik yuz berdi.`);
      }
      
      router.refresh();
    } catch (e) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsBulkRejecting(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const res = await approveMaterial(id);
    setProcessingId(null);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Material tasdiqlandi!");
      setMaterials(materials.filter(m => m.id !== id));
      // Remove from selection if approved individually
      setSelectedIds(prev => {
        const newSel = prev.filter(selectedId => selectedId !== id);
        if (newSel.length === 0) setIsBulkRejectingInput(false);
        return newSel;
      });
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
      setSelectedIds(prev => {
        const newSel = prev.filter(selectedId => selectedId !== id);
        if (newSel.length === 0) setIsBulkRejectingInput(false);
        return newSel;
      });
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
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('everythingIsFine') || "Hamma narsa joyida!"}</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          {t('noPendingMaterials') || "Ayni paytda tasdiqlashni kutayotgan materiallar yo'q. Barcha yuborilgan fayllar ko'rib chiqilgan."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar for Bulk Select */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-4 z-10 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-blue-900 dark:text-blue-300 font-bold">
                {selectedIds.length} ta material tanlandi
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Belgilanganlarni bir marta bosish orqali tasdiqlash yoki rad etish mumkin
              </p>
            </div>
          </div>
          
          {isBulkRejectingInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={bulkRejectReason}
                onChange={(e) => setBulkRejectReason(e.target.value)}
                placeholder="Umumiy rad etish sababi..."
                autoFocus
                className="w-full md:w-64 px-4 py-2 text-sm rounded-xl border border-red-200 dark:border-red-900/50 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm outline-none transition-all"
              />
              <button
                onClick={handleBulkRejectSubmit}
                disabled={isBulkRejecting}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 text-sm font-semibold rounded-xl shadow-sm shadow-red-500/20 transition-all flex items-center gap-2"
              >
                {isBulkRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yuborish"}
              </button>
              <button
                onClick={() => { setIsBulkRejectingInput(false); setBulkRejectReason(""); }}
                disabled={isBulkRejecting}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-sm font-medium rounded-xl transition-all"
              >
                Bekor
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsBulkRejectingInput(true)}
                disabled={isBulkApproving}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-sm font-bold rounded-xl transition-all"
              >
                <XCircle className="w-4 h-4" />
                Barchasini rad etish
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={isBulkApproving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-emerald-500/20 transition-all"
              >
                {isBulkApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Barchasini tasdiqlash
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table Layout */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={selectedIds.length === materials.length && materials.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:border-slate-600"
                  />
                </th>
                <th className="px-4 py-4 w-16 text-center">{t('no') || "No"}</th>
                <th className="px-4 py-4">{t('file') || "Fayl"}</th>
                <th className="px-4 py-4">{t('titleAndSubject') || "Sarlavha va Fan"}</th>
                <th className="px-4 py-4">{t('uploadedBy') || "Yuklagan shaxs"}</th>
                <th className="px-4 py-4">{t('date') || "Sana"}</th>
                <th className="px-6 py-4 text-right">{t('actions') || "Amallar"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {materials.map((material, index) => (
                <tr key={material.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${selectedIds.includes(material.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(material.id)}
                      onChange={() => toggleOne(material.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:border-slate-600"
                    />
                  </td>
                  <td className="px-4 py-4 text-center text-slate-500 dark:text-slate-400 font-medium">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 group">
                      {material.driveFileId ? (
                        <>
                          <img 
                            src={`https://drive.google.com/thumbnail?id=${material.driveFileId}&sz=w100`} 
                            alt="thumbnail" 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800" style={{ display: 'none' }}>
                            {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS]}
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                          {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS]}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 min-w-[250px] max-w-[300px]">
                    <p className="font-bold text-slate-900 dark:text-white truncate" title={material.title}>
                      {material.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5" title={material.subject}>
                      {material.subject}
                    </p>
                  </td>
                  <td className="px-4 py-4 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 text-xs font-bold">
                        {material.uploadedBy?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                          {material.uploadedBy?.name || "Noma'lum"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {material.uploadedBy?.department?.name || material.uploadedBy?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400 text-sm">
                    {format(new Date(material.createdAt), "dd.MM.yyyy, HH:mm")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setPreviewMaterial(material)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-xl transition-colors"
                        title="Ko'rish"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      
                      {isRejecting === material.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Sabab..."
                            autoFocus
                            className="w-32 px-2 py-1.5 text-xs rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 outline-none focus:border-red-500"
                          />
                          <button
                            onClick={() => handleRejectSubmit(material.id)}
                            disabled={processingId === material.id}
                            className="p-1.5 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            title="Rad etishni tasdiqlash"
                          >
                            {processingId === material.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => { setIsRejecting(null); setRejectReason(""); }}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            Bekor
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setIsRejecting(material.id)}
                            disabled={processingId === material.id || isBulkApproving}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                            title={t('reject') || "Rad etish"}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApprove(material.id)}
                            disabled={processingId === material.id || isBulkApproving}
                            className="flex justify-center items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all"
                          >
                            {processingId === material.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            {t('approve') || "Tasdiqlash"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
