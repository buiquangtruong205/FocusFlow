const fs = require('fs');
const src = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\603b6cb8-01bf-47f5-9bf3-eca2d8a9719f\\uploaded_media_1769737728549.png';
const dest = 'e:\\FocusFlow\\public\\logo.png';

try {
    if (!fs.existsSync('e:\\FocusFlow\\public')) {
        fs.mkdirSync('e:\\FocusFlow\\public');
    }
    fs.copyFileSync(src, dest);
    console.log('Successfully copied logo to ' + dest);
    console.log('File size: ' + fs.statSync(dest).size);
} catch (err) {
    console.error('Error copying file:', err);
}
