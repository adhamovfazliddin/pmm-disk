const fs = require('fs');
const path = require('path');

const directories = ['src/app', 'src/components'];

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Base background
    content = content.replace(/dark:bg-slate-950/g, 'dark:bg-[#0B0F17]');
    content = content.replace(/dark:bg-black/g, 'dark:bg-[#0B0F17]');
    content = content.replace(/dark:bg-zinc-950/g, 'dark:bg-[#0B0F17]');

    // Cards & Containers (make sure not to double replace if script is run multiple times)
    content = content.replace(/dark:bg-slate-900\/80/g, 'dark:bg-[#111827]/80');
    // For raw dark:bg-slate-900 not followed by /
    content = content.replace(/dark:bg-slate-900(?!\/)/g, 'dark:bg-[#111827]/80');
    
    // Add backdrop-blur-sm and border if replacing cards (heuristically)
    // Actually, maybe safer to just do the replacements and then do a pass for inputs?
    // Let's do exact replaces for inputs first since they use slate-800
    content = content.replace(/dark:bg-slate-800\/50/g, 'dark:bg-[#1E293B]/60');
    content = content.replace(/dark:bg-slate-800(?!\/)/g, 'dark:bg-[#1E293B]/60');
    
    content = content.replace(/dark:border-slate-800\/80/g, 'dark:border-slate-800/80 backdrop-blur-sm');
    content = content.replace(/dark:border-slate-700/g, 'dark:border-slate-700/60');
    
    // Sidebars typically use slate-900 or slate-950 in layout.tsx.
    // We already replaced slate-900 with dark:bg-[#111827]/80 and slate-950 with dark:bg-[#0B0F17].
    // Let's fix up layout sidebars if possible by searching for sidebar elements?
    // The prompt says "Sidebar: Use dark:bg-[#0D131F] with dark:border-slate-800/70"
    if (filePath.includes('layout.tsx')) {
        content = content.replace(/dark:bg-\[\#111827\]\/80/g, 'dark:bg-[#0D131F]'); // Re-replace what we just did for sidebar
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

for (const dir of directories) {
    walkDir(dir);
}
