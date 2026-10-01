const fs = require('fs');
let c = fs.readFileSync('server/db/seed.ts', 'utf8');
c = c.replace(/\\n/g, '\n');
fs.writeFileSync('server/db/seed.ts', c);
