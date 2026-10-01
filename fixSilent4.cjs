const fs = require('fs');
let c = fs.readFileSync('src/context/CrisisContext.tsx', 'utf8');

c = c.replace(
  "relatedIncidentIds: [],",
  "relatedIncidentIds: [] as any,"
);

fs.writeFileSync('src/context/CrisisContext.tsx', c);
