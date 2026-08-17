const fs = require('fs');
const path = require('path');

function loadEnv(filePath) {
  try {
    const full = filePath || path.join(__dirname, '..', '.env');
    if (!fs.existsSync(full)) return;
    const text = fs.readFileSync(full, 'utf8');
    for (const line of text.split('\n')) {
      const s = line.trim();
      if (!s || s.startsWith('#')) continue;
      const i = s.indexOf('=');
      if (i < 0) continue;
      const key = s.slice(0, i).trim();
      let val = s.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch (_) { /* ignore */ }
}

loadEnv();
module.exports = { loadEnv };
