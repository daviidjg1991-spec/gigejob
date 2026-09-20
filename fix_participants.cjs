const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/setParticipantsInfo\(\(prev\) => \(\{\n\s*\.\.\.prev,\n\s*\[pid\]: snapshot\.data\(\),\n\s*\}\)\);/g, 
  'setParticipantsInfo((prev) => ({\n              ...prev,\n              [pid]: { id: pid, ...snapshot.data() },\n            }));');

// There might be another place where participantDetails are merged, let's fix the otherInfo line directly as a fallback!
code = code.replace(/const otherInfo = participantsInfo\[otherId\] \|\|/g, 
  'const otherInfo = { id: otherId, ...(participantsInfo[otherId] ||');

code = code.replace(/chat\.participantDetails\?\.\[otherId\] \|\| \{ name: "Usuario" \};/g, 
  'chat.participantDetails?.[otherId] || { name: "Usuario" }) };');

fs.writeFileSync('src/App.tsx', code);
