const fs = require('fs');
let c = fs.readFileSync('src/context/CrisisContext.tsx', 'utf8');

c = c.replace(
  'triggerPhaseT0,',
  'triggerPhaseT0,\n        addNewCivilianIncident,'
);

fs.writeFileSync('src/context/CrisisContext.tsx', c);
console.log('Added addNewCivilianIncident to context export');
