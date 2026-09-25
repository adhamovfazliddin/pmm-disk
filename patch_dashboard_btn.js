const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// The Table View Eye button
const oldEyeTable = `<Eye className="w-4 h-4" />
                          </button>`;
const newEyeTable = `<Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); setQrMaterial(material); }}
                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:text-purple-400 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                            title="QR-Kod"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>`;
if(content.includes(oldEyeTable)) {
    content = content.replace(oldEyeTable, newEyeTable);
} else {
    console.log("Could not find table eye button");
}

// The Grid view preview button
const oldPreviewGrid = `{t('preview')}
                      </button>`;
const newPreviewGrid = `{t('preview')}
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); setQrMaterial(material); }}
                        className="flex items-center justify-center p-2 text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="QR-Kod"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>`;
if(content.includes(oldPreviewGrid)) {
    content = content.replace(oldPreviewGrid, newPreviewGrid);
} else {
    console.log("Could not find grid preview button");
}

fs.writeFileSync(file, content, 'utf8');
console.log("DashboardClient updated");