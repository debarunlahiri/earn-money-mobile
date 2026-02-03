const fs = require('fs');
const path = require('path');

// Simple icon copy script - copies the logo to all required Android mipmap directories
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
    
    // Remove existing launcher icons
    const existingFiles = fs.readdirSync(dir).filter(file => file.startsWith('ic_launcher'));
    existingFiles.forEach(file => {
      const filePath = path.join(dir, file);
      fs.unlinkSync(filePath);
      console.log('Removed:', filePath);
    });
    
    // Copy new logo
    fs.copyFileSync(sourceLogo, targetPath);
    console.log('Copied logo to:', targetPath);
  } else {
    console.log('Directory not found:', dir);
  }
});

console.log('Icon copying complete!');
console.log('Note: You may need to rebuild the app to see changes.');
console.log('Try: npx expo start --clear');
