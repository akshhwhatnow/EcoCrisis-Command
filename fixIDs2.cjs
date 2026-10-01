const fs = require('fs');
let c = fs.readFileSync('server/db/seed.ts', 'utf8');

const startMarker = '// 2. Insert Authoritative T0 Incidents';
const endMarker = '// 3. Insert Authoritative Resources';

const before = c.substring(0, c.indexOf(startMarker) + startMarker.length);
const after = c.substring(c.indexOf(endMarker));

const mvpIncidents = `
      // --- MVP DEMONSTRATION SCENARIO INCIDENTS ---
      // I-1: Community evacuation (Critical, Immediate)
      await client.query(
        'INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))',
        [
          'I-1', 'INC-2026-MVP-1', 'Hillside Village Community Evacuation', 'Wildfire', 'Human Settlement & Safety', 'Critical', 'Immediate', 'Active',
          'Rapidly expanding wildfire perimeter threatening Hillside residential zone. Primary arterial road threatened by smoke and ember storm. [SIMULATED - DEMO DATA]',
          'Partly Threatened', true, 1200, 0, 0, [], ['Substation Alpha', 'Highway Access Corridor'], 1.5,
          121.215, 14.845, 'POLYGON((121.210 14.840, 121.220 14.840, 121.220 14.850, 121.210 14.850, 121.210 14.840))'
        ]
      );

      // I-2: Farm and livestock emergency (High, Hours)
      await client.query(
        'INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))',
        [
          'I-2', 'INC-2026-MVP-2', 'Valley Dairy Farm & Livestock Emergency', 'Wildfire', 'Agriculture & Food Security', 'High', 'Hours', 'Active',
          'Commercial dairy and cattle facility located downstream of wildfire smoke plume. Estimated 3.5 hr safe buffer window before containment breach. [SIMULATED - DEMO DATA]',
          'Open', false, 45, 840, 320.5, [], ['Valley Feed Mill', 'Water Canal Sluice Gate'], 4.2,
          121.225, 14.835, 'POLYGON((121.220 14.830, 121.230 14.830, 121.230 14.840, 121.220 14.840, 121.220 14.830))'
        ]
      );

      // I-3: Wildlife habitat emergency (Medium-High, Hours)
      await client.query(
        'INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))',
        [
          'I-3', 'INC-2026-MVP-3', 'Pine Ridge Wildlife Sanctuary Emergency', 'Wildfire', 'Ecosystem & Biodiversity', 'Medium-High', 'Hours', 'Active',
          'Ecological reserve housing endangered species and wetland nesting grounds. Flank containment firebreak needed. [SIMULATED - DEMO DATA]',
          'Rough Track Only', true, 8, 0, 0, ['Endangered Avian Species', 'Local Amphibians'], ['Ecological Monitoring Station', 'Ranger Outpost 4'], 12.8,
          121.205, 14.855, 'POLYGON((121.200 14.850, 121.210 14.850, 121.210 14.860, 121.200 14.860, 121.200 14.850))'
        ]
      );
`;

const globalIncidentsData = [
  { id: 'I-11', type: 'Wildfire', lat: 14.745, lng: 121.115, name: 'San Mateo Forest Fire', severity: 'Critical', desc: 'Rapidly expanding wildfire perimeter threatening residential zones.', people: 1200 },
  { id: 'I-12', type: 'Severe Flood Alert', lat: 28.6139, lng: 77.2090, name: 'Yamuna River Overflow', severity: 'High', desc: 'Heavy monsoon rains causing river overflow and urban flooding.', people: 8500 },
  { id: 'I-13', type: 'Typhoon / Cyclone Warning', lat: 35.6895, lng: 139.6917, name: 'Typhoon Hagibis Approach', severity: 'Critical', desc: 'Category 5 storm approaching the metropolitan area.', people: 50000 },
  { id: 'I-14', type: 'Volcanic Eruption Risk', lat: -7.5361, lng: 110.4427, name: 'Mount Merapi Activity', severity: 'High', desc: 'Increased seismic activity and ash plumes detected.', people: 4000 },
  { id: 'I-15', type: 'Industrial Chemical Spill', lat: 31.2304, lng: 121.4737, name: 'Port Hazardous Leak', severity: 'Critical', desc: 'Toxic chemical leak from industrial container ship.', people: 2100 },
  { id: 'I-16', type: 'Medical Emergency Cluster', lat: 23.8103, lng: 90.4125, name: 'Cholera Outbreak Zone', severity: 'High', desc: 'Sudden spike in acute medical emergencies in dense sectors.', people: 1500 },
  { id: 'I-17', type: 'Extreme Heat Wave', lat: 24.8607, lng: 67.0011, name: 'Sindh Heat Dome', severity: 'Medium-High', desc: 'Temperatures exceeding 48C causing widespread grid failure.', people: 25000 },
  { id: 'I-18', type: 'Structural Infrastructure Collapse', lat: 41.0082, lng: 28.9784, name: 'Marmaray Tunnel Breach', severity: 'Critical', desc: 'Major structural failure in underground transit infrastructure.', people: 800 },
  { id: 'I-19', type: 'Coastal Flood Emergency', lat: 21.0278, lng: 105.8342, name: 'Red River Delta Surge', severity: 'Medium-High', desc: 'Coastal tidal surge overwhelming local water defenses.', people: 3400 },
  { id: 'I-20', type: 'Bushfire Emergency', lat: -33.8688, lng: 151.2093, name: 'Blue Mountains Blaze', severity: 'High', desc: 'Uncontrolled bushfires threatening suburban outskirts.', people: 600 }
];

let globalCode = '';
globalIncidentsData.forEach((inc, index) => {
  globalCode += "await client.query('INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))', ['" + inc.id + "', 'INC-2026-GLB-" + (index+1) + "', '" + inc.name + "', '" + inc.type + "', 'General', '" + inc.severity + "', 'Immediate', 'Active', '" + inc.desc + "', 'Open', true, " + inc.people + ", 0, 0, [], [], 0, " + inc.lng + ", " + inc.lat + ", 'POLYGON((" + (inc.lng-0.01) + " " + (inc.lat-0.01) + ", " + (inc.lng+0.01) + " " + (inc.lat-0.01) + ", " + (inc.lng+0.01) + " " + (inc.lat+0.01) + ", " + (inc.lng-0.01) + " " + (inc.lat+0.01) + ", " + (inc.lng-0.01) + " " + (inc.lat-0.01) + "))']);\n";
});

fs.writeFileSync('server/db/seed.ts', before + '\n' + mvpIncidents + '\n' + globalCode + '\n    ' + after);
console.log('Fixed IDs and rewrote seed.ts!');
