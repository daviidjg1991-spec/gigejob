const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\) : \(\s*\(\(profileUser\?\.name \|\| "\?"\)\.charAt\(0\)\)\s*\)/g, 
  ') : (\n                    <img src="/default-avatar.svg" alt="Avatar" className="w-full h-full object-cover" />\n                  )');

fs.writeFileSync('src/App.tsx', code);
