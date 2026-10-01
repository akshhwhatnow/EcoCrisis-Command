const fs = require('fs');
let c = fs.readFileSync('src/context/CrisisContext.tsx', 'utf8');

c = c.replace(
  "addNotification: (title: string, message: string, level?: 'critical' | 'warning' | 'info' | 'success', incidentId?: string) => void;",
  "addNotification: (title: string, message: string, level?: 'critical' | 'warning' | 'info' | 'success', incidentId?: string, fromBroadcast?: boolean) => void;\n  addNewCivilianIncident: (agency: string, desc: string, location: string, lat: number, lng: number) => void;"
);

// fix line 329 issue where boolean is passed as string, we had:
// addNotification('🚨 New Civilian Report: ' + type, 'Location: ' + location + ' - ' + desc, 'critical', newId);
// But wait, fromBroadcast is the 5th arg. 
// signature: (title: string, message: string, level: 'critical' | 'warning' | 'info' | 'success', incidentId?: string, fromBroadcast = false)
// wait, the error is: Argument of type 'boolean' is not assignable to parameter of type 'string'
// That means the definition is:
// (title: string, message: string, level: 'critical' | 'warning' | 'info' | 'success', fromBroadcast = false, incidentId?: string) ???
// Let's check the signature in the file!

fs.writeFileSync('src/context/CrisisContext.tsx', c);
