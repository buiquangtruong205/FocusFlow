const fs = require('fs');
const path = require('path');

const targetPath = 'e:\\FocusFlow\\public\\logo.png';
console.log('Checking file:', targetPath);

try {
    if (fs.existsSync(targetPath)) {
        const stats = fs.statSync(targetPath);
        console.log('File exists. Size:', stats.size);
    } else {
        console.log('File does NOT exist.');
    }
} catch (err) {
    console.error('Error checking file:', err);
}
