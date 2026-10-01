const fs = require('fs');
let c = fs.readFileSync('src/context/CrisisContext.tsx', 'utf8');

// Fix addNotification signature
c = c.replace(
  "(title: string, message: string, level: 'critical' | 'warning' | 'info' | 'success', fromBroadcast = false)",
  "(title: string, message: string, level: 'critical' | 'warning' | 'info' | 'success', incidentId?: string, fromBroadcast = false)"
);

fs.writeFileSync('src/context/CrisisContext.tsx', c);
console.log('Fixed addNotification signature');
