const fs = require('fs');
let c = fs.readFileSync('src/context/CrisisContext.tsx', 'utf8');

c = c.replace(
  "confidence: 85,",
  "confidence: 85,\n      lastUpdated: new Date().toISOString(),\n      aiInsights: [],\n      liveTimeline: [],\n      relatedIncidentIds: [],"
);

fs.writeFileSync('src/context/CrisisContext.tsx', c);
