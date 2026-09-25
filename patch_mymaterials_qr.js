const fs = require('fs');

function patchMyMaterials() {
  const file = 'src/app/dashboard/my-materials/MyMaterialsClient.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add QrCode import
  if (!content.includes('QrCode')) {
    content = content.replace('import { Search, Plus, FileText, Video, Presentation, FileArchive, File, MoreVertical, Edit2, Trash2, Eye, Download, LayoutGrid, List } from "lucide-react";', 'import { Search, Plus, FileText, Video, Presentation, FileArchive, File, MoreVertical, Edit2, Trash2, Eye, Download, LayoutGrid, List, QrCode } from "lucide-react";');
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
      'const [previewMaterial, setPreviewMaterial] = useState<any | null>(null);',
      'const [previewMaterial, setPreviewMaterial] = useState<any | null>(null);\n    const [qrMaterial, setQrMaterial] = useState<any | null>(null);'
    );
  }

  // 4. Add QR button to Table (there are multiple instances of actions, let's inject after <Eye>)
  const oldTableEye = `<Eye className="w-4 h-4" />
                      </button>
                      <a`;
  const newTableEye = `<Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); setQrMaterial(material); }}
                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:text-purple-400 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                        title="QR-Kod"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <a`;
  content = content.split(oldTableEye).join(newTableEye);

  // 5. Grid View
  const oldGridEye = `<Eye className="w-4 h-4" /> Ko'rish
                            </button>
                            <a`;
  const newGridEye = `<Eye className="w-4 h-4" /> Ko'rish
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); setQrMaterial(material); }}
                              className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-xl transition-colors"
                              title="QR-Kod"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <a`;
  content = content.split(oldGridEye).join(newGridEye);

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
  console.log("MyMaterialsClient patched successfully.");
}

patchMyMaterials();