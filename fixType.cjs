const fs = require('fs');
let c = fs.readFileSync('src/types/index.ts', 'utf8');
c = c.replace(/'USER' \|\r?\n  \|/, "'USER'\n  |");
c = c.replace(/'USER' \|\n  \|/, "'USER'\n  |");
fs.writeFileSync('src/types/index.ts', c);
console.log('Fixed UserRole!');
