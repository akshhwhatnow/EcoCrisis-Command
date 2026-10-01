const fs = require('fs');

let c = fs.readFileSync('server/db/seed.ts', 'utf8');

const queryTemplate = `
      await client.query(
        \`INSERT INTO incidents (
          id, external_ref, name, incident_type, sector, severity, urgency, status,
          description, accessibility_status, river_route_available,
          impact_people_at_risk, impact_livestock_count, impact_crop_hectares,
          impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2,
          location_geom, perimeter_geom
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          ST_SetSRID(ST_MakePoint($18, $19), 4326),
          ST_SetSRID(ST_GeomFromText($20), 4326)
        )\`,
        [
          '{ID}',
          '{REF}',
          '{NAME}',
          '{TYPE}',
          '{SECTOR}',
          '{SEVERITY}',
          '{URGENCY}',
          '{STATUS}',
          '{DESC}',
          '{ACC}',
          true,
          {PEOPLE},
          {LIVESTOCK},
          10,
          [],
          ['{RISK}'],
          5.0,
          {LNG},
          {LAT},
          'POLYGON(({LNG1} {LAT1}, {LNG2} {LAT1}, {LNG2} {LAT2}, {LNG1} {LAT2}, {LNG1} {LAT1}))'
        ]
      );
`;

const incidents = [
  { id: 'I-1', type: 'Wildfire - Community Evacuation', lat: 14.845, lng: 121.215, name: 'San Mateo Forest Fire', severity: 'Critical', desc: 'Rapidly expanding wildfire perimeter threatening residential zones.', people: 1200 },
  { id: 'I-2', type: 'Severe Flood Alert', lat: 28.6139, lng: 77.2090, name: 'Yamuna River Overflow', severity: 'High', desc: 'Heavy monsoon rains causing river overflow and urban flooding.', people: 8500 },
  { id: 'I-3', type: 'Typhoon / Cyclone Warning', lat: 35.6895, lng: 139.6917, name: 'Typhoon Hagibis Approach', severity: 'Critical', desc: 'Category 5 storm approaching the metropolitan area.', people: 50000 },
  { id: 'I-4', type: 'Volcanic Eruption Risk', lat: -7.5361, lng: 110.4427, name: 'Mount Merapi Activity', severity: 'High', desc: 'Increased seismic activity and ash plumes detected.', people: 4000 },
  { id: 'I-5', type: 'Industrial Chemical Spill', lat: 31.2304, lng: 121.4737, name: 'Port Hazardous Leak', severity: 'Critical', desc: 'Toxic chemical leak from industrial container ship.', people: 2100 },
  { id: 'I-6', type: 'Medical Emergency Cluster', lat: 23.8103, lng: 90.4125, name: 'Cholera Outbreak Zone', severity: 'High', desc: 'Sudden spike in acute medical emergencies in dense sectors.', people: 1500 },
  { id: 'I-7', type: 'Extreme Heat Wave', lat: 24.8607, lng: 67.0011, name: 'Sindh Heat Dome', severity: 'Medium-High', desc: 'Temperatures exceeding 48C causing widespread grid failure.', people: 25000 },
  { id: 'I-8', type: 'Structural Infrastructure Collapse', lat: 41.0082, lng: 28.9784, name: 'Marmaray Tunnel Breach', severity: 'Critical', desc: 'Major structural failure in underground transit infrastructure.', people: 800 },
  { id: 'I-9', type: 'Coastal Flood Emergency', lat: 21.0278, lng: 105.8342, name: 'Red River Delta Surge', severity: 'Medium-High', desc: 'Coastal tidal surge overwhelming local water defenses.', people: 3400 },
  { id: 'I-10', type: 'Bushfire Emergency', lat: -33.8688, lng: 151.2093, name: 'Blue Mountains Blaze', severity: 'High', desc: 'Uncontrolled bushfires threatening suburban outskirts.', people: 600 }
];

let generatedCode = '';
incidents.forEach((inc, index) => {
  let q = queryTemplate;
  q = q.replace('{ID}', inc.id);
  q = q.replace('{REF}', 'INC-2026-00' + (index + 1));
  q = q.replace('{NAME}', inc.name);
  q = q.replace('{TYPE}', inc.type);
  q = q.replace('{SECTOR}', 'General');
  q = q.replace('{SEVERITY}', inc.severity);
  q = q.replace('{URGENCY}', 'Immediate');
  q = q.replace('{STATUS}', 'Active');
  q = q.replace('{DESC}', inc.desc);
  q = q.replace('{ACC}', 'Open');
  q = q.replace('{PEOPLE}', inc.people);
  q = q.replace('{LIVESTOCK}', Math.floor(Math.random() * 500));
  q = q.replace('{RISK}', 'Critical');
  
  q = q.replace('{LNG}', inc.lng);
  q = q.replace('{LAT}', inc.lat);
  
  const lng1 = (inc.lng - 0.005).toFixed(4);
  const lng2 = (inc.lng + 0.005).toFixed(4);
  const lat1 = (inc.lat - 0.005).toFixed(4);
  const lat2 = (inc.lat + 0.005).toFixed(4);
  
  q = q.replace(/{LNG1}/g, lng1);
  q = q.replace(/{LNG2}/g, lng2);
  q = q.replace(/{LAT1}/g, lat1);
  q = q.replace(/{LAT2}/g, lat2);
  
  generatedCode += q;
});

const startMarker = '// 2. Insert Authoritative T0 Incidents';
const endMarker = '// 3. Insert Authoritative Resources';

const before = c.substring(0, c.indexOf(startMarker) + startMarker.length);
const after = c.substring(c.indexOf(endMarker));

fs.writeFileSync('server/db/seed.ts', before + '\\n' + generatedCode + '\\n    ' + after);
console.log('Done generating incidents!');
