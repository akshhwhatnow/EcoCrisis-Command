const fs = require('fs');
let c = fs.readFileSync('src/context/CrisisContext.tsx', 'utf8');

c = c.replace(
  'read: boolean;',
  'read: boolean;\n  incidentId?: string;'
);

c = c.replace(
  "addNotification: (title: string, message: string, level?: 'critical' | 'warning' | 'info' | 'success') => void;",
  "addNotification: (title: string, message: string, level?: 'critical' | 'warning' | 'info' | 'success', incidentId?: string) => void;\n  addNewCivilianIncident: (agency: string, desc: string, location: string, lat: number, lng: number) => void;"
);

c = c.replace(
  "const addNotification = useCallback((title: string, message: string, level: 'critical' | 'warning' | 'info' | 'success' = 'info') => {",
  "const addNotification = useCallback((title: string, message: string, level: 'critical' | 'warning' | 'info' | 'success' = 'info', incidentId?: string) => {"
);

c = c.replace(
  "level,",
  "level,\n      incidentId,"
);

const newFunction = `
  const addNewCivilianIncident = useCallback((agency: string, desc: string, location: string, lat: number, lng: number) => {
    const newId = 'CIV-' + Math.floor(Math.random() * 10000);
    
    let type = 'General Emergency';
    let sev = 'High';
    let icon = 'dYs"'; // default alert
    const descLower = desc.toLowerCase();
    
    if (descLower.includes('fire')) { type = 'Wildfire'; sev = 'Critical'; icon = 'dY"'; }
    else if (descLower.includes('flood') || descLower.includes('water')) { type = 'Severe Flood Alert'; sev = 'Critical'; icon = 'dYOS'; }
    else if (descLower.includes('med') || descLower.includes('injur') || descLower.includes('heart')) { type = 'Medical Emergency'; sev = 'Critical'; icon = 'dY?'; }
    else if (descLower.includes('crash') || descLower.includes('accident')) { type = 'Traffic Collision'; sev = 'High'; icon = 'dY?s'; }
    else if (descLower.includes('storm') || descLower.includes('wind')) { type = 'Severe Storm'; sev = 'High'; icon = 'dYO,?'; }

    const newInc: Incident = {
      id: newId,
      name: location + ' (' + agency + ')',
      type: type,
      locationName: location,
      coordinates: { lat, lng },
      severity: sev as any,
      urgency: 'Immediate',
      status: 'Active',
      description: desc + ' [CIVILIAN REPORTED]',
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      accessibility: { status: 'Unknown', details: '' },
      impact: { peopleAtRisk: 1, livestockCount: 0, cropHectares: 0, habitatAreaKm2: 0, infrastructureAtRisk: [] },
      requiredResources: ['Local Patrol', 'Paramedic'],
      assignedResources: [],
      confidence: 'Medium',
    };

    setIncidents(prev => [newInc, ...prev]);
    addNotification('🚨 New Civilian Report: ' + type, 'Location: ' + location + ' - ' + desc, 'critical', newId);
    playTacticalSound('alert');
  }, [addNotification, playTacticalSound]);
`;

c = c.replace(
  "const triggerPhaseT1 = useCallback(() => {",
  newFunction + "\n  const triggerPhaseT1 = useCallback(() => {"
);

c = c.replace(
  "addNotification,",
  "addNotification,\n          addNewCivilianIncident,"
);

fs.writeFileSync('src/context/CrisisContext.tsx', c);
console.log('Patched CrisisContext.tsx');
