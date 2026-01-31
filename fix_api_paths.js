const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/api/apiService.js', 'utf8');

// Replace all /api/ prefixes in API calls
content = content.replace(/api\.(get|post|put|delete)\('\/api\//g, "api.$1('/");

// Write back
fs.writeFileSync('src/api/apiService.js', content, 'utf8');

console.log('✅ Fixed all API paths - removed /api/ prefix from endpoints');
