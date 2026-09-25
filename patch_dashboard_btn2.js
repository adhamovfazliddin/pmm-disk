const fs = require('fs');

function patch(filepath, regex, replacement) {
    let content = fs.readFileSync(filepath, 'utf8');
    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(filepath, content, 'utf8');
        console.log("Patched " + filepath);
    } else {
        console.log("Could not match regex in " + filepath);
    }
}

const file = 'src/app/dashboard/DashboardClient.tsx';

// 1. Table View Eye button
const regexTable = /<Eye className="w-4 h-4" \/>\s*<\/button>/;
const repTable = `<Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQrMaterial(material); }}
                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:text-purple-400 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                            title="QR-Kod"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>`;
patch(file, regexTable, repTable);

// 2. Grid View ExternalLink {t('preview')} button
const regexGrid = /<ExternalLink className="w-4 h-4" \/> \{t\('preview'\)\}\s*<\/button>/;
const repGrid = `<ExternalLink className="w-4 h-4" /> {t('preview')}
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQrMaterial(material); }}
                        className="flex items-center justify-center p-2 text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="QR-Kod"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>`;
patch(file, regexGrid, repGrid);
