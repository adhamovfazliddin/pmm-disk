const fs = require('fs');

function patchDashboard() {
  const file = 'src/app/dashboard/DashboardClient.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add QrCode import
  if (!content.includes('QrCode')) {
    content = content.replace('X, Loader2 } from "lucide-react";', 'X, Loader2, QrCode } from "lucide-react";');
  }
  
  // 2. Add QRCodeModal import
  if (!content.includes('QRCodeModal')) {
    content = content.replace(
      'import MaterialPreviewModal from "@/components/MaterialPreviewModal";',
      'import MaterialPreviewModal from "@/components/MaterialPreviewModal";\nimport QRCodeModal from "@/components/QRCodeModal";'
    );
  }

  // 3. Add state
  if (!content.includes('const [qrMaterial, setQrMaterial]')) {
    content = content.replace(
      'const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);',
      'const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);\n    const [qrMaterial, setQrMaterial] = useState<any | null>(null);'
    );
  }

  // 4. Add QR button to Grid
  const oldGridBtn = `<ExternalLink className="w-4 h-4" /> {t('preview')}
                      </button>
                      <a`;
  const newGridBtn = `<ExternalLink className="w-4 h-4" /> {t('preview')}
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); setQrMaterial(material); }}
                        className="flex items-center justify-center p-2 text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="QR-Kod"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <a`;
  content = content.replace(oldGridBtn, newGridBtn);

  // 5. Add QR button to Table
  const oldTableBtn = `<Eye className="w-4 h-4" />
                          </button>
                          <a`;
  const newTableBtn = `<Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); setQrMaterial(material); }}
                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:text-purple-400 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                            title="QR-Kod"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <a`;
  content = content.replace(oldTableBtn, newTableBtn);

  // 6. Inject the QRCodeModal component at the bottom before closing tag
  const oldClosing = `/>
      </div>
    );
  }`;
  const newClosing = `/>
        <QRCodeModal
          isOpen={!!qrMaterial}
          onClose={() => setQrMaterial(null)}
          material={qrMaterial}
        />
      </div>
    );
  }`;
  content = content.replace(oldClosing, newClosing);

  fs.writeFileSync(file, content, 'utf8');
  console.log("DashboardClient patched successfully.");
}

patchDashboard();