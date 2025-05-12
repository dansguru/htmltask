const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '../abcz');
const targetDir = path.join(__dirname, '../public/abcz');

async function copyTools() {
    try {
        // Ensure target directory exists
        await fs.ensureDir(targetDir);
        
        // Copy all files from abcz to public/abcz
        await fs.copy(sourceDir, targetDir);
        
        console.log('Successfully copied tool files to public directory');
    } catch (err) {
        console.error('Error copying tool files:', err);
        process.exit(1);
    }
}

copyTools(); 