const fs = require('fs');
const src = 'e:\\FocusFlow\\logo.png';
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
