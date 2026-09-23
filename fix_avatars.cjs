const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace Dicebear URLs
code = code.replace(/`https:\/\/api\.dicebear\.com\/7\.x\/avataaars\/svg\?seed=\$\{profileUser\?\.id \|\| 'default'\}`/g, '"/default-avatar.svg"');
code = code.replace(/`https:\/\/api\.dicebear\.com\/7\.x\/avataaars\/svg\?seed=\$\{finalUsername\}`/g, '"/default-avatar.svg"');
code = code.replace(/`https:\/\/api\.dicebear\.com\/7\.x\/avataaars\/svg\?seed=\$\{user\.uid\}`/g, '"/default-avatar.svg"');

// Replace AvatarDisplay fallback
code = code.replace(/<div className=\{`primary-gradient flex items-center justify-center text-white font-bold \$\{className\}`\}>\s*\{\(author\?\.name \|\| author\?\.username \|\| "\?"\)\.charAt\(0\)\.toUpperCase\(\)\}\s*<\/div>/g, 
  '<img src="/default-avatar.svg" alt="Avatar" className={`object-cover ${className}`} />');

// Replace Top Navbar Fallback (Lines 13883-13885)
code = code.replace(/<div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-110 transition-transform text-xs">\s*\{\(user\?\.username \|\| user\?\.firstName \|\| "\?"\)\.charAt\(0\)\}\s*<\/div>/g, 
  '<img src="/default-avatar.svg" alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm group-hover:scale-110 transition-transform" />');

// Replace Review Modal Fallback (Lines 28386-28388)
code = code.replace(/<div className="w-16 h-16 rounded-full primary-gradient flex items-center justify-center text-white font-bold text-xl shadow-sm">\s*\{\(user\.username \|\| user\.firstName \|\| "\?"\)\.charAt\(0\)\}\s*<\/div>/g, 
  '<img src="/default-avatar.svg" alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />');

// Replace Profile Page Fallback (Lines 18222-18224)
code = code.replace(/\) : \(\s*\(\(profileUser\?\.name \|\| "\?"\)\.charAt\(0\)\)\s*\)/g, 
  ') : (\n                    <img src="/default-avatar.svg" alt="Avatar" className="w-full h-full object-cover" />\n                  )');

fs.writeFileSync('src/App.tsx', code);
