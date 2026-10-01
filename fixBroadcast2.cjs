const fs = require('fs');
let c = fs.readFileSync('src/context/CrisisContext.tsx', 'utf8');

// 1. Update addNotification's postMessage to include incidentId
c = c.replace(
  "channel.postMessage({ type: 'NEW_NOTIFICATION', payload: { title, message, level } });",
  "channel.postMessage({ type: 'NEW_NOTIFICATION', payload: { title, message, level, incidentId } });"
);

// 2. Update the BroadcastChannel onmessage to pass incidentId to addNotification
// and also listen for NEW_CIVILIAN_INCIDENT
const oldUseEffect = `    // Listen for cross-tab notifications
    useEffect(() => {
      try {
        const channel = new BroadcastChannel('crisis-notifications');
        channel.onmessage = (event) => {
          if (event.data && event.data.type === 'NEW_NOTIFICATION') {
            const { title, message, level } = event.data.payload;
            addNotification(title, message, level, undefined, true);
          }
        };
        return () => channel.close();
      } catch (e) {}
    }, [addNotification]);`;

const newUseEffect = `    // Listen for cross-tab notifications
    useEffect(() => {
      try {
        const channel = new BroadcastChannel('crisis-notifications');
        channel.onmessage = (event) => {
          if (event.data && event.data.type === 'NEW_NOTIFICATION') {
            const { title, message, level, incidentId } = event.data.payload;
            addNotification(title, message, level, incidentId, true);
          } else if (event.data && event.data.type === 'NEW_CIVILIAN_INCIDENT') {
            setIncidents(prev => {
              if (prev.some(i => i.id === event.data.payload.newInc.id)) return prev;
              return [event.data.payload.newInc, ...prev];
            });
          }
        };
        return () => channel.close();
      } catch (e) {}
    }, [addNotification]);`;

c = c.replace(oldUseEffect, newUseEffect);

// 3. Update addNewCivilianIncident to broadcast NEW_CIVILIAN_INCIDENT
c = c.replace(
  "setIncidents(prev => [newInc, ...prev]);\n      addNotification('🚨 New Civilian Report: ' + type, 'Location: ' + location + ' - ' + desc, 'critical', newId);",
  `setIncidents(prev => [newInc, ...prev]);
      addNotification('🚨 New Civilian Report: ' + type, 'Location: ' + location + ' - ' + desc, 'critical', newId);
      try {
        const channel = new BroadcastChannel('crisis-notifications');
        channel.postMessage({ type: 'NEW_CIVILIAN_INCIDENT', payload: { newInc } });
        channel.close();
      } catch(e) {}`
);

fs.writeFileSync('src/context/CrisisContext.tsx', c);
console.log('Fixed BroadcastChannel logic');
