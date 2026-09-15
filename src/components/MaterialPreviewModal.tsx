"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, Download, FileText, Video, Presentation, 
  FileArchive, File, ExternalLink, Maximize, Minimize
} from "lucide-react";
import { getDriveDownloadUrl } from "@/lib/drive";
import { recordMaterialActivity } from "@/app/actions/analytics";
import { useLanguage } from "@/lib/i18n";

const FORMAT_ICONS = {
  PDF: <FileText className="w-6 h-6 text-red-500" />,
  Video: <Video className="w-6 h-6 text-blue-500" />,
  Presentation: <Presentation className="w-6 h-6 text-orange-500" />,
  Archive: <FileArchive className="w-6 h-6 text-purple-500" />,
  Document: <File className="w-6 h-6 text-blue-600" />,
};

interface Material {
  id: string;
  title: string;
  subject: string;
  format: string;
  driveFileId: string;
}

interface MaterialPreviewModalProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MaterialPreviewModal({ material, isOpen, onClose }: MaterialPreviewModalProps) {
  const { t } = useLanguage();

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track activity recording to avoid duplicate calls for the same material
  const lastRecordedId = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen && material && material.id !== lastRecordedId.current) {
      lastRecordedId.current = material.id;
      recordMaterialActivity(material.id, 'VIEW').catch(console.error);
    }
    if (!isOpen) {
      lastRecordedId.current = null;
      setIsFullscreen(false); // Modal yopilganda to'liq ekranni o'chirish
    }
  }, [isOpen, material]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !material) return null;

  let previewUrl = `https://drive.google.com/file/d/${material.driveFileId}/preview?rm=minimal`;
  
  if (material.format === "Document") {
    previewUrl = `https://docs.google.com/document/d/${material.driveFileId}/preview?rm=minimal`;
  } else if (material.format === "Presentation") {
    previewUrl = `https://docs.google.com/presentation/d/${material.driveFileId}/embed?start=false&loop=false&delayms=3000`;
  }

  const viewUrl = `https://drive.google.com/file/d/${material.driveFileId}/view`;
  const downloadUrl = getDriveDownloadUrl(material.driveFileId, material.format);
  const canPreview = !["Archive"].includes(material.format);

  const isDocument = material.format === "Document";
  
  let containerClasses = "bg-white dark:bg-[#111827] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 ";
  
  if (isFullscreen) {
    containerClasses += "w-full sm:w-[100vw] h-[100dvh] sm:h-[100dvh] rounded-none z-[110]";
  } else {
    if (isDocument) {
      containerClasses += "w-full sm:w-[95vw] md:w-[850px] h-[100dvh] sm:h-[95vh] rounded-none sm:rounded-2xl";
    } else {
      containerClasses += "w-full sm:w-[95vw] md:w-[90vw] max-w-7xl h-[100dvh] sm:h-[88vh] rounded-none sm:rounded-2xl";
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={containerClasses}>
        {/* Mobile Drag Handle (kept for aesthetic, though it's full screen now) */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden cursor-grab" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]/90 gap-3">
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
            <div className="p-2 bg-white dark:bg-[#1E293B]/60 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700/60 shrink-0 hidden sm:flex">
              {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS] || <File className="w-6 h-6 text-gray-500" />}
            </div>
            <div className="flex flex-col overflow-hidden min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate" title={material.title}>
                {material.title}
              </h2>
              <span className="inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 self-start mt-0.5">
                {material.subject}
              </span>
            </div>
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Open in Google Drive */}
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 text-sm font-medium rounded-xl transition-colors"
              title={t('openInDrive')}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">{t('openInDrive')}</span>
            </a>

            {/* Download */}
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => recordMaterialActivity(material.id, 'DOWNLOAD')}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 text-sm font-medium rounded-xl transition-colors"
              title={t('download')}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('download')}</span>
            </a>
            
            {/* Fullscreen Toggle (Faqat Document uchun) */}
            {isDocument && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-500 hover:bg-slate-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white rounded-xl transition-colors hidden sm:flex"
                title="Kengaytirish"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-colors"
              title={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative w-full h-full bg-slate-100 dark:bg-[#0B0F17]">
          {canPreview ? (
            <iframe 
              src={previewUrl}
              className="absolute inset-0 w-full h-full border-0 bg-white"
              allow="autoplay; fullscreen"
              title={material.title}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="p-6 bg-white dark:bg-[#1E293B]/60 rounded-2xl shadow-sm mb-6 border border-slate-200 dark:border-slate-700/60">
                {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS] || <File className="w-16 h-16 text-gray-400" />}
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{material.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                {t('previewFallback')}
              </p>
              <a 
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => recordMaterialActivity(material.id, 'DOWNLOAD')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                <Download className="w-5 h-5" />
                <span>{t('download')}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
