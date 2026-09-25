const fs = require('fs');

const file = 'src/app/dashboard/DashboardClient.tsx';
let content = fs.readFileSync(file, 'utf8');

const regexGrid = /<ExternalLink className="w-4 h-4" \/> \{t\('preview'\)\}\s*<\/button>/g;
const repGrid = `<ExternalLink className="w-4 h-4" /> {t('preview')}
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQrMaterial(material); }}
                        className="flex items-center justify-center p-2 text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="QR-Kod"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>`;
                      
const regexTable = /<Eye className="w-4 h-4" \/>\s*<\/button>/g;
const repTable = `<Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQrMaterial(material); }}
                              className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:text-purple-400 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                              title="QR-Kod"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>`;

let changed = false;

// We will do a manual replace matching to ensure ALL instances have QrCode.
// But wait, the previous script already replaced the FIRST one, so now the FIRST one is:
// <ExternalLink className="w-4 h-4" /> {t('preview')} \n </button> \n <button ... QrCode ... >
// If I run regex matching `<ExternalLink ...> \n </button>`, it will match the FIRST one again and duplicate the QrCode button!

// Let's do a safer string search
const parts = content.split(`<ExternalLink className="w-4 h-4" /> {t('preview')}
                      </button>`);
// Rejoin with the replacement, but only if QrCode isn't immediately following
for (let i = 0; i < parts.length - 1; i++) {
    if (!parts[i+1].includes('<QrCode')) {
        parts[i] = parts[i] + `<ExternalLink className="w-4 h-4" /> {t('preview')}
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQrMaterial(material); }}
                        className="flex items-center justify-center p-2 text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="QR-Kod"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>`;
        changed = true;
    } else {
        parts[i] = parts[i] + `<ExternalLink className="w-4 h-4" /> {t('preview')}
                      </button>`;
    }
}
content = parts.join('');

const tableParts = content.split(`<Eye className="w-4 h-4" />
                          </button>`);
for (let i = 0; i < tableParts.length - 1; i++) {
    if (!tableParts[i+1].includes('<QrCode')) {
        tableParts[i] = tableParts[i] + `<Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQrMaterial(material); }}
                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:text-purple-400 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                            title="QR-Kod"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>`;
        changed = true;
    } else {
        tableParts[i] = tableParts[i] + `<Eye className="w-4 h-4" />
                          </button>`;
    }
}
content = tableParts.join('');

if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log("DashboardClient fully patched!");
} else {
    console.log("No missing QrCode buttons found in DashboardClient.");
}