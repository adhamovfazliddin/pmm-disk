"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, Minimize2, Download, FileText, Video, Presentation, 
  FileArchive, File, ZoomIn, ZoomOut, RotateCcw 
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isIdle, setIsIdle] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  // Track activity recording to avoid duplicate calls for the same material
  const lastRecordedId = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen && material && material.id !== lastRecordedId.current) {
      lastRecordedId.current = material.id;
      recordMaterialActivity(material.id, 'VIEW').catch(console.error);
      setZoom(1);
    }
    if (!isOpen) {
      lastRecordedId.current = null;
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

  // Idle timer for HUD
  useEffect(() => {
    if (!isOpen) return;

    const handleActivity = () => {
      setIsIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (isFullScreen) {
        idleTimer.current = setTimeout(() => setIsIdle(true), 3500);
      }
    };

    if (isFullScreen) {
      window.addEventListener("mousemove", handleActivity);
      window.addEventListener("keydown", handleActivity);
      handleActivity(); // start timer
    } else {
      setIsIdle(false);
    }

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isFullScreen, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "Escape") {
        if (isFullScreen) {
          exitFullScreen();
        } else {
          onClose();
        }
      }
      
      if (isFullScreen) {
        if (e.key === "=" || e.key === "+") {
          setZoom(prev => Math.min(prev + 0.1, 3));
        }
        if (e.key === "-") {
          setZoom(prev => Math.max(prev - 0.1, 0.5));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isFullScreen, onClose]);

  const toggleFullScreen = async () => {
    if (!isFullScreen) {
      setIsFullScreen(true);
      try {
        if (modalRef.current?.requestFullscreen) {
          await modalRef.current.requestFullscreen();
        }
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      exitFullScreen();
    }
  };

  const exitFullScreen = async () => {
    setIsFullScreen(false);
    setZoom(1);
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Error attempting to exit fullscreen:", err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        setZoom(1);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!isOpen || !material) return null;

  // Use stable Google Drive preview URL to avoid Google Docs cross-origin/format rejection
  const previewUrl = `https://drive.google.com/file/d/${material.driveFileId}/preview?rm=minimal`;
  const downloadUrl = getDriveDownloadUrl(material.driveFileId);
  const canPreview = !["Archive"].includes(material.format);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-[#111827] w-full sm:max-w-5xl h-[90vh] sm:h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-300 ${
          isFullScreen ? "fixed inset-0 !h-screen !w-screen !max-w-none !rounded-none z-[100] dark:bg-[#111827] bg-[#111827]" : ""
        }`}
      >
        {/* Mobile Drag Handle */}
        {!isFullScreen && (
          <div className="w-full flex justify-center pt-3 pb-1 sm:hidden cursor-grab" onClick={onClose}>
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
          </div>
        )}

        {/* Header */}
        {!isFullScreen && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]/90 gap-4">
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
            
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={toggleFullScreen}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <Presentation className="w-4 h-4" />
                <span>Taqdimotni Boshlash</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-colors"
                title={t('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className={`flex-1 relative overflow-hidden ${isFullScreen ? 'bg-[#111827] w-full h-full flex items-center justify-center' : 'bg-slate-100 dark:bg-[#0B0F17]'}`}>
          {canPreview ? (
            <div className={isFullScreen ? "w-full h-full flex items-center justify-center overflow-hidden relative p-8" : "w-full h-full flex items-center justify-center overflow-hidden relative"}>
              <iframe 
                ref={iframeRef}
                src={previewUrl}
                className={`transition-transform duration-200 ease-out origin-center ${
                  isFullScreen 
                    ? "max-w-6xl w-full h-[85vh] rounded-xl shadow-2xl border border-gray-800 bg-white" 
                    : "border-0 w-full h-full"
                }`}
                style={isFullScreen ? { transform: `scale(${zoom})` } : { transform: `scale(${zoom})` }}
                allow="autoplay; fullscreen"
                title={material.title}
              />
            </div>
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

          {/* Floating Control Bar (HUD) in Fullscreen */}
          {isFullScreen && (
            <div 
              className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl shadow-2xl z-50 text-white transition-opacity duration-500 ease-in-out ${
                isIdle ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              onMouseEnter={() => setIsIdle(false)}
            >
              <div className="flex items-center gap-1 pr-3 border-r border-white/20">
                <button 
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors active:bg-white/30"
                  onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
                  title="Kichraytirish (-)"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button 
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors active:bg-white/30"
                  onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}
                  title="Kattalashtirish (+)"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors active:bg-white/30 ml-1"
                  onClick={() => setZoom(1)}
                  title="Asliga qaytarish"
                >
                  <RotateCcw className="w-4 h-4 text-white/70" />
                </button>
              </div>

              <div className="flex items-center gap-1 pl-3">
                <a 
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => recordMaterialActivity(material.id, 'DOWNLOAD')}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors active:bg-white/30 text-white"
                  title="Yuklab olish"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button 
                  onClick={exitFullScreen}
                  className="ml-2 flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-100 rounded-lg transition-colors border border-red-500/30"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Chiqish (Esc)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

