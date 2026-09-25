const fs = require('fs');

function injectModal(file, marker) {
    let content = fs.readFileSync(file, 'utf8');
    const modalStr = `
      <QRCodeModal 
        isOpen={!!qrMaterial} 
        onClose={() => setQrMaterial(null)} 
        material={qrMaterial} 
      />
    </div>`;
    
    // Replace the last occurrence of `</div>` (actually, the main container's closing `</div>`)
    // A safer way: replace `    </div>\n  );\n}` with `      <QRCodeModal ... />\n    </div>\n  );\n}`
    const oldClosing1 = '    </div>\n  );\n}';
    const oldClosing2 = '    </div>\r\n  );\r\n}';
    
    if (content.includes(oldClosing1)) {
        content = content.replace(oldClosing1, modalStr + '\n  );\n}');
        fs.writeFileSync(file, content, 'utf8');
        console.log("Injected modal into " + file);
        return;
    }
    
    if (content.includes(oldClosing2)) {
        content = content.replace(oldClosing2, modalStr + '\r\n  );\r\n}');
        fs.writeFileSync(file, content, 'utf8');
        console.log("Injected modal into " + file);
        return;
    }
    
    // For MyMaterialsClient which ends with: `    </div>\n    </>\n  );\n}`
    const oldClosing3 = '    </div>\n    </>\n  );\n}';
    const oldClosing4 = '    </div>\r\n    </>\r\n  );\r\n}';

    if (content.includes(oldClosing3)) {
        content = content.replace(oldClosing3, modalStr + '\n    </>\n  );\n}');
        fs.writeFileSync(file, content, 'utf8');
        console.log("Injected modal into " + file);
        return;
    }

    if (content.includes(oldClosing4)) {
        content = content.replace(oldClosing4, modalStr + '\r\n    </>\r\n  );\r\n}');
        fs.writeFileSync(file, content, 'utf8');
        console.log("Injected modal into " + file);
        return;
    }

    console.log("Failed to inject modal into " + file);
}

injectModal('src/app/dashboard/DashboardClient.tsx');
injectModal('src/app/dashboard/my-materials/MyMaterialsClient.tsx');