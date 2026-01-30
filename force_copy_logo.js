const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\603b6cb8-01bf-47f5-9bf3-eca2d8a9719f\\uploaded_media_1769738325836.png';
const destinations = [
    'e:\\FocusFlow\\public\\logo.png',
    'e:\\FocusFlow\\dist\\logo.png', // Fallback for production builds
    'e:\\FocusFlow\\build\\icon.png' // Potential other build folder
];

console.log('Starting copy operation...');

if (!fs.existsSync(src)) {
    console.error('ERROR: Source file does not exist:', src);
    process.exit(1);
}

destinations.forEach(dest => {
    try {
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) {
            console.log('Creating directory:', dir);
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.copyFileSync(src, dest);
        console.log('Successfully copied to:', dest, 'Size:', fs.statSync(dest).size);
    } catch (err) {
        console.log('Skipping destination (error):', dest, err.message);
    }
});
