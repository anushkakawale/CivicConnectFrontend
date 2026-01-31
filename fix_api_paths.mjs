import { readFileSync, writeFileSync } from 'fs';

// Read the file
let content = readFileSync('src/api/apiService.js', 'utf8');

// Replace all /api/ prefixes in API calls
content = content.replace(/api\.(get|post|put|delete)\('\/api\//g, "api.$1('/");

// Write back
writeFileSync('src/api/apiService.js', content, 'utf8');

console.log('✅ Fixed all API paths - removed /api/ prefix from endpoints');
