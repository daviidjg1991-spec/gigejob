const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
const search = "              </div>\n            ) : (";
const replace = "              </div>\n              )\n            ) : (";
if (content.includes(search)) {
  // we only want to replace the ONE corresponding to the popupSubTab design
  // Let's find it. It's right before "Leads / Suscripciones"
  const idx = content.indexOf("Leads / Suscripciones");
  const sub = content.substring(0, idx);
  const lastIndex = sub.lastIndexOf(search);
  if (lastIndex !== -1) {
    content = content.substring(0, lastIndex) + replace + content.substring(lastIndex + search.length);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Fixed");
  } else {
    console.log("Not found 1");
  }
} else {
  console.log("Not found global");
}
