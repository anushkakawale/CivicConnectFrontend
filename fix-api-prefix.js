/**
 * CRITICAL FIX SCRIPT
 * This script removes /api prefix from all service files
 * Run this with: node fix-api-prefix.js
 */

const fs = require('fs');
const path = require('path');

const servicesToFix = [
    'src/services/wardOfficerService.js',
    'src/services/profileService.js',
    'src/services/departmentOfficerService.js'
];

servicesToFix.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);

    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        // Replace all instances of '/api/ with just '/ 
        const originalContent = content;
        content = content.replace(/axios\.(get|post|put|delete)\('\/api\//g, "axios.$1('/");

        if (content !== originalContent) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Fixed: ${filePath}`);
        } else {
            console.log(`⏭️  Skipped (no changes): ${filePath}`);
        }
    } else {
        console.log(`❌ Not found: ${filePath}`);
    }
});

console.log('\n🎉 All service files fixed!');
console.log('⚠️  REMEMBER TO RESTART THE DEV SERVER!');
