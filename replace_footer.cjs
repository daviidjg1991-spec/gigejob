const fs = require('fs');
const typesContent = fs.readFileSync('src/types.ts', 'utf8');
const newFooterContent = fs.readFileSync('/Users/david/footer_output.ts', 'utf8');

const startMatch = typesContent.indexOf('export const DEFAULT_FOOTER_CONFIG: FooterConfig = {');
if (startMatch === -1) {
  console.error('Could not find DEFAULT_FOOTER_CONFIG');
  process.exit(1);
}

const endMatch = typesContent.indexOf('export interface Review', startMatch);
if (endMatch === -1) {
  console.error('Could not find end of DEFAULT_FOOTER_CONFIG');
  process.exit(1);
}

const finalTypesContent = typesContent.substring(0, startMatch) + newFooterContent + '\n\n' + typesContent.substring(endMatch);
fs.writeFileSync('src/types.ts', finalTypesContent);
console.log('Successfully updated src/types.ts');
