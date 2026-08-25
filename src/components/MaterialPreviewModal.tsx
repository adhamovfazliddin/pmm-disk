"use client";

import { useState, useEffect } from "react";
import { X, Maximize2, Minimize2, Download, FileText, Video, Presentation, FileArchive, File } from "lucide-react";
import { getDrivePreviewUrl, getDriveDownloadUrl } from "@/lib/drive";
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
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (isOpen && material) {
      // Record view activity when modal opens
      recordMaterialActivity(material.id, 'VIEW').catch(console.error);
    }
  }, [isOpen, material]);

  if (!isOpen || !material) return null;

  const previewUrl = getDrivePreviewUrl(material.driveFileId);
  const downloadUrl = getDriveDownloadUrl(material.driveFileId);
  
  // Disable preview for Archives (ZIP, RAR, etc.)
  const canPreview = !["Archive"].includes(material.format);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-white dark:bg-[#111827]/90 w-full sm:max-w-5xl h-[90vh] sm:h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-300 ${
          isFullScreen ? "fixed inset-0 !h-full !max-w-none !rounded-none" : ""
        }`}
      >
        {/* Mobile Drag Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden cursor-grab" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]/90">
          <div className="flex items-center gap-3 overflow-hidden pr-4">
            <div className="p-2 bg-white dark:bg-[#1E293B]/60 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700/60 shrink-0">
              {FORMAT_ICONS[material.format as keyof typeof FORMAT_ICONS] || <File className="w-6 h-6 text-gray-500" />}
            </div>
            <div className="flex flex-col overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title={material.title}>
                {material.title}
              </h2>
              <span className="inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 self-start mt-0.5">
                {material.subject}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <a 
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => recordMaterialActivity(material.id, 'DOWNLOAD')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t('download')}</span>
            </a>
            
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="hidden sm:block p-2 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={isFullScreen ? t('exitFullScreen') : t('fullScreen')}
            >
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-colors"
              title={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-100 dark:bg-[#0B0F17] relative overflow-hidden">
          {canPreview ? (
            <iframe 
              src={previewUrl}
              className="w-full h-full border-0"
              allow="autoplay"
              title={material.title}
            ></iframe>
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
