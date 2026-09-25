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

const file = 'src/app/dashboard/my-materials/MyMaterialsClient.tsx';

// 1. Table View Eye button
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
patch(file, regexTable, repTable);

// 2. Grid View Eye button
const regexGrid = /<Eye className="w-4 h-4" \/> Ko'rish\s*<\/button>/g;
const repGrid = `<Eye className="w-4 h-4" /> Ko'rish
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQrMaterial(material); }}
                              className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-xl transition-colors"
                              title="QR-Kod"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>`;
patch(file, regexGrid, repGrid);
