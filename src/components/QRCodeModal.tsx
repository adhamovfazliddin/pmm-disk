import React, { useRef } from 'react';
import { X, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: {
    title: string;
    format: string;
    driveFileId: string;
    webViewLink?: string;
    driveUrl?: string;
  } | null;
}

export default function QRCodeModal({ isOpen, onClose, material }: QRCodeModalProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  if (!isOpen || !material) return null;

  // URL ni shakllantirish
  // Foydalanuvchilar (talabalar) telefondan skaner qilganida to'g'ri ochilishi uchun
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://andijonpmm.uz';
  
  let targetUrl = '';
  if (material.format === "PDF" || material.format?.toLowerCase() === "pdf") {
    targetUrl = `${origin}/api/preview/${material.driveFileId}`;
  } else {
    targetUrl = material.webViewLink || material.driveUrl || `https://drive.google.com/file/d/${material.driveFileId}/view`;
  }

  const handleDownload = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Oq fon berish (agar fon kerak bo'lsa)
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_${material.title.substring(0, 20)}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-4">
            QR-Kod: {material.title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
            <QRCodeSVG 
              value={targetUrl}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#0f172a"}
              level={"Q"}
              includeMargin={false}
              ref={svgRef}
            />
          </div>
          <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
            {"Talabalar ushbu QR-kodni telefon kamerasidan skaner qilib, materialni to'g'ridan-to'g'ri ochishlari mumkin."}
          </p>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 w-full justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20"
          >
            <Download className="w-5 h-5" />
            Rasm qilib yuklab olish
          </button>
        </div>
      </div>
    </div>
  );
}