const fs = require('fs');
let c = fs.readFileSync('src/context/CrisisContext.tsx', 'utf8');

c = c.replace(
  "assignedResources: [],",
  "assignedResourceIds: [],"
);

c = c.replace(
  "isBackendConnected: boolean;",
  "isBackendConnected: boolean;\n  addNewCivilianIncident?: (agency: string, desc: string, location: string, lat: number, lng: number) => void;"
);

fs.writeFileSync('src/context/CrisisContext.tsx', c);
