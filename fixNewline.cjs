const fs = require('fs');
let c = fs.readFileSync('src/context/CrisisContext.tsx', 'utf8');

c = c.replace(/addNotification,\\n          addNewCivilianIncident,/g, 'addNotification, addNewCivilianIncident,');

fs.writeFileSync('src/context/CrisisContext.tsx', c);
console.log('Fixed literal newlines');
