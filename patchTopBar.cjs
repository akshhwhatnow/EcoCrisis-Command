const fs = require('fs');
let c = fs.readFileSync('src/components/layout/TopBar.tsx', 'utf8');

c = c.replace(
  "className={`p-3 rounded-xl border text-xs transition-colors ${",
  "onClick={() => { if (n.incidentId) { setSelectedIncidentId(n.incidentId); setActiveTab('incidents'); setShowNotifications(false); } }}\n                        className={`p-3 rounded-xl border text-xs transition-colors cursor-pointer ${"
);

fs.writeFileSync('src/components/layout/TopBar.tsx', c);
console.log('Patched TopBar.tsx');
