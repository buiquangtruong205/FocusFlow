const fs = require('fs');
console.log('Starting copy...');
const src = 'C:/Users/Admin/.gemini/antigravity/brain/603b6cb8-01bf-47f5-9bf3-eca2d8a9719f/uploaded_media_1769737728549.png';
const dest = 'e:/FocusFlow/public/logo.png';

if (!fs.existsSync(src)) {
    console.log('Source file does not exist:', src);
} else {
    console.log('Source exists.');
    try {
        if (!fs.existsSync('e:/FocusFlow/public')) fs.mkdirSync('e:/FocusFlow/public');
        fs.copyFileSync(src, dest);
        console.log('Copy done.');
    } catch (e) {
        console.log('Error:', e.message);
    }
}
process.exit(0);
