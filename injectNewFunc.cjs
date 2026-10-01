const fs = require('fs');
let c = fs.readFileSync('src/context/CrisisContext.tsx', 'utf8');

const insertionPoint = '  // Initial Backend State Synchronization';

const newFunction = `
  const addNewCivilianIncident = useCallback((agency: string, desc: string, location: string, lat: number, lng: number) => {
    const newId = 'CIV-' + Math.floor(Math.random() * 10000);
    
    let type = 'General Emergency';
    let sev = 'High';
    let icon = '🚨'; // default alert
    const descLower = desc.toLowerCase();
    
    if (descLower.includes('fire')) { type = 'Wildfire'; sev = 'Critical'; icon = '🔥'; }
    else if (descLower.includes('flood') || descLower.includes('water')) { type = 'Severe Flood Alert'; sev = 'Critical'; icon = '🌊'; }
    else if (descLower.includes('med') || descLower.includes('injur') || descLower.includes('heart')) { type = 'Medical Emergency'; sev = 'Critical'; icon = '🏥'; }
    else if (descLower.includes('crash') || descLower.includes('accident')) { type = 'Traffic Collision'; sev = 'High'; icon = '💥'; }
    else if (descLower.includes('storm') || descLower.includes('wind')) { type = 'Severe Storm'; sev = 'High'; icon = '🌪️'; }

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

c = c.replace(insertionPoint, newFunction + insertionPoint);

// Also we need to export it in the value object.
// We already have `addNotification, addNewCivilianIncident,` from previous botched attempts!
// Wait, did that botch attempt actually succeed? Let's check if `addNewCivilianIncident,` is in the file.
fs.writeFileSync('src/context/CrisisContext.tsx', c);
console.log('Injected addNewCivilianIncident');
