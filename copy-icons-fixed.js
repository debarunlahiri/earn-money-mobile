const fs = require('fs');
const path = require('path');

// Copy logo to all required Android mipmap directories including round icons
const sourceLogo = './assets/logo/logo.jpg';
const androidDirs = [
  './android/app/src/main/res/mipmap-mdpi/',
  './android/app/src/main/res/mipmap-hdpi/',
  './android/app/src/main/res/mipmap-xhdpi/',
  './android/app/src/main/res/mipmap-xxhdpi/',
  './android/app/src/main/res/mipmap-xxxhdpi/'
];

console.log('Copying logo to Android mipmap directories...');

// Check if source logo exists
if (!fs.existsSync(sourceLogo)) {
  console.error('Error: Source logo not found at', sourceLogo);
  process.exit(1);
}

// Copy logo to each mipmap directory
androidDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const targetPath = path.join(dir, 'ic_launcher.png');
    const targetRoundPath = path.join(dir, 'ic_launcher_round.png');
    
    // Copy new logo for both regular and round icons
    fs.copyFileSync(sourceLogo, targetPath);
    fs.copyFileSync(sourceLogo, targetRoundPath);
    console.log('Copied logo to:', targetPath);
    console.log('Copied logo to:', targetRoundPath);
  } else {
    console.log('Directory not found:', dir);
  }
});

console.log('Icon copying complete!');
console.log('Note: You may need to rebuild the app to see changes.');
console.log('Try: npx expo run:android');
