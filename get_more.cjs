const fs = require('fs');
const logContent = fs.readFileSync('.gemini/antigravity-ide/brain/1046fbc7-a224-4b95-87c1-e7751281bf70/.system_generated/tasks/task-212.log', 'utf8');

// The log output is in format `id => JSON`
const lines = logContent.split('\n');
let currentId = null;
let currentJson = '';

for (const line of lines) {
  const match = line.match(/^(\w+) => (.*)/);
  if (match) {
    if (currentId) {
       console.log(`--- ${currentId} ---`);
       // console.log(currentJson); // only interested in keys
    }
    currentId = match[1];
    currentJson = match[2] + '\n';
  } else if (currentId) {
    currentJson += line + '\n';
  }
}
if (currentId) {
   console.log(`--- ${currentId} ---`);
}
