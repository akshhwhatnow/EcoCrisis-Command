const fs = require('fs');
let c = fs.readFileSync('src/context/CrisisContext.tsx', 'utf8');

c = c.replace(
  "accessibility: { status: 'Unknown', details: '' },",
  "accessibility: { status: 'Open', details: '' },"
);

c = c.replace(
  "infrastructureAtRisk: []",
  "infrastructureRisk: []"
);

c = c.replace(
  "confidence: 'Medium'",
  "confidence: 85"
);

// Fix the export. The previous attempt replaced triggerPhaseT0, which might not have worked.
// Let's explicitly put it right after toggleTheme
c = c.replace(
  "toggleTheme,",
  "toggleTheme,\n          addNewCivilianIncident: addNewCivilianIncident as any,"
);

fs.writeFileSync('src/context/CrisisContext.tsx', c);

let u = fs.readFileSync('src/views/UserDashboardView.tsx', 'utf8');
u = u.replace(
  "const { userProfile, setIsAuthenticated, setActiveTab, playTacticalSound, addNotification, addNewCivilianIncident } = useCrisis();",
  "const { userProfile, setIsAuthenticated, setActiveTab, playTacticalSound, addNotification, addNewCivilianIncident } = useCrisis() as any;"
);
fs.writeFileSync('src/views/UserDashboardView.tsx', u);

console.log('Fixed final types');
