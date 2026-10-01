const fs = require('fs');
let c = fs.readFileSync('src/context/CrisisContext.tsx', 'utf8');

c = c.replace(
  'addNotification(title, message, level, true);',
  'addNotification(title, message, level, undefined, true);'
);

// Also I need to ensure the interface is updated properly!
// Let's replace the interface line completely just to be safe.
c = c.replace(
  "addNotification: (title: string, message: string, level?: 'critical' | 'warning' | 'info' | 'success', incidentId?: string) => void;",
  "addNotification: (title: string, message: string, level?: 'critical' | 'warning' | 'info' | 'success', incidentId?: string, fromBroadcast?: boolean) => void;\n  addNewCivilianIncident: (agency: string, desc: string, location: string, lat: number, lng: number) => void;"
);

// And ensure addNewCivilianIncident is in the value export
// I fixed literal newline earlier. Let's make sure it's exported.
// I already did: c = c.replace(/addNotification,\\n          addNewCivilianIncident,/g, 'addNotification, addNewCivilianIncident,');

fs.writeFileSync('src/context/CrisisContext.tsx', c);
console.log('Fixed broadcast call');
