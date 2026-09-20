const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace Dicebear URLs
code = code.replace(/`https:\/\/api\.dicebear\.com\/7\.x\/avataaars\/svg\?seed=\$\{profileUser\?\.id \|\| 'default'\}`/g, '"/default-avatar.svg"');
code = code.replace(/`https:\/\/api\.dicebear\.com\/7\.x\/avataaars\/svg\?seed=\$\{finalUsername\}`/g, '"/default-avatar.svg"');
code = code.replace(/`https:\/\/api\.dicebear\.com\/7\.x\/avataaars\/svg\?seed=\$\{user\.uid\}`/g, '"/default-avatar.svg"');

// Replace AvatarDisplay fallback
code = code.replace(/<div className=\{`primary-gradient flex items-center justify-center text-white font-bold \$\{className\}`\}>\s*\{\(author\?\.name \|\| author\?\.username \|\| "\?"\)\.charAt\(0\)\.toUpperCase\(\)\}\s*<\/div>/g, 
  '<img src="/default-avatar.svg" alt="Avatar" className={`object-cover ${className}`} />');

fs.writeFileSync('src/App.tsx', code);
