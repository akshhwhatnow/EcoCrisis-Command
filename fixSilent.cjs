const fs = require('fs');
let c = fs.readFileSync('src/context/CrisisContext.tsx', 'utf8');

c = c.replace(
  "accessibility: { status: 'Open', details: '' },",
  "accessibility: { status: 'Open', details: '', roadName: location, riverRouteAvailable: false },"
);

c = c.replace(
  "impact: { peopleAtRisk: 1, livestockCount: 0, cropHectares: 0, habitatAreaKm2: 0, infrastructureRisk: [] },",
  "impact: { peopleAtRisk: 1, livestockCount: 0, cropHectares: 0, habitatAreaKm2: 0, infrastructureRisk: [], areaKm2: 0, livestockTypes: [], cropTypes: [], wildlifeSpecies: [] },"
);

let u = fs.readFileSync('src/types/index.ts', 'utf8');
if (!u.includes('addNewCivilianIncident')) {
  u = u.replace(
    '  isBackendConnected: boolean;',
    '  isBackendConnected: boolean;\n  addNewCivilianIncident?: (agency: string, desc: string, location: string, lat: number, lng: number) => void;'
  );
  fs.writeFileSync('src/types/index.ts', u);
}

fs.writeFileSync('src/context/CrisisContext.tsx', c);
