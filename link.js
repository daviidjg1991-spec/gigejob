const fs = require('fs');
const xcode = require('xcode');
const plist = require('plist');

const projectPath = 'ios/App/App.xcodeproj/project.pbxproj';
const googlePlistPath = 'ios/App/App/GoogleService-Info.plist';
const infoPlistPath = 'ios/App/App/Info.plist';

// 1. Read REVERSED_CLIENT_ID from GoogleService-Info.plist
if (!fs.existsSync(googlePlistPath)) {
  console.error("GoogleService-Info.plist not found.");
  process.exit(1);
}
const googlePlist = plist.parse(fs.readFileSync(googlePlistPath, 'utf8'));
const reversedClientId = googlePlist.REVERSED_CLIENT_ID;

if (!reversedClientId) {
  console.error("REVERSED_CLIENT_ID not found in GoogleService-Info.plist.");
  process.exit(1);
}

// 2. Update Info.plist
const infoPlist = plist.parse(fs.readFileSync(infoPlistPath, 'utf8'));
if (!infoPlist.CFBundleURLTypes) {
  infoPlist.CFBundleURLTypes = [];
}
let found = false;
for (const urlType of infoPlist.CFBundleURLTypes) {
  if (urlType.CFBundleURLSchemes && urlType.CFBundleURLSchemes.includes(reversedClientId)) {
    found = true;
    break;
  }
}
if (!found) {
  infoPlist.CFBundleURLTypes.push({
    CFBundleURLSchemes: [reversedClientId]
  });
  fs.writeFileSync(infoPlistPath, plist.build(infoPlist));
  console.log("Updated Info.plist with REVERSED_CLIENT_ID.");
} else {
  console.log("Info.plist already contains REVERSED_CLIENT_ID.");
}

// 3. Update project.pbxproj
const myProj = xcode.project(projectPath);

myProj.parseSync();
const res = myProj.addResourceFile('GoogleService-Info.plist', { target: myProj.getFirstTarget().uuid });
if (!res) {
  console.log("Failed to add resource file or already exists.");
} else {
  fs.writeFileSync(projectPath, myProj.writeSync());
  console.log("Updated project.pbxproj to include GoogleService-Info.plist.");
}
