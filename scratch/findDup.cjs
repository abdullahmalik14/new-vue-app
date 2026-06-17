const fs = require('fs');
const content = fs.readFileSync('src/dev/templates/dashboard/analytics/DashboardAnalyticsPage.vue', 'utf8');

// We can just use vue/compiler-sfc if it's installed, or regex
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // A naive check for duplicate attributes on the same line
  const tagMatch = line.match(/<[a-zA-Z0-9_-]+([^>]+)>/);
  if (tagMatch) {
    const attrsStr = tagMatch[1];
    const attrsMatch = attrsStr.match(/([a-zA-Z0-9_:-]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s]+))?/g);
    if (attrsMatch) {
      const names = attrsMatch.map(a => a.split('=')[0].trim());
      const duplicates = names.filter((item, index) => names.indexOf(item) !== index);
      if (duplicates.length > 0) {
        console.log(`Duplicate '${duplicates[0]}' found at line ${i + 1}: ${line.trim()}`);
      }
    }
  }
}
