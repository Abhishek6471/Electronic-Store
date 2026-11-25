// Run from the project root: node tools/check-images.js
const fs = require('fs'), path = require('path'); let found = 0; const missing = [];
for (let i = 1; i <= 24; i++) { const f = path.join(__dirname, '..', 'assets', 'images', `p${i}.jpg`);
  if (!fs.existsSync(f)) { missing.push(`p${i}.jpg (missing)`); continue; }
  const b = fs.readFileSync(f); const jpg = b.length > 3 && b[0] === 0xFF && b[1] === 0xD8;
  if (!jpg) missing.push(`p${i}.jpg (not a real JPEG)`); else if (b.length > 500 * 1024) { found++; console.log(`note: p${i}.jpg is ${Math.round(b.length / 1024)} KB, consider shrinking`); } else found++; }
console.log(`${found} of 24 product images present.`); if (missing.length) console.log('Problems:\n  ' + missing.join('\n  ')); process.exit(found === 24 ? 0 : 1);
