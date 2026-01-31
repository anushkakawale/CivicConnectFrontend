import re

# Read the file
with open('src/api/apiService.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all /api/ prefixes in API calls
content = re.sub(r"api\.(get|post|put|delete)\('/api/", r"api.\1('/", content)

# Write back
with open('src/api/apiService.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed all API paths - removed /api/ prefix from endpoints")
