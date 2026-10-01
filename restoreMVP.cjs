const fs = require('fs');

let c = fs.readFileSync('server/db/seed.ts', 'utf8');

const mvpIncidents = `
      // --- MVP DEMONSTRATION SCENARIO INCIDENTS ---
      // I-1: Community evacuation (Critical, Immediate)
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
          'I-1', 'INC-2026-MVP-1', 'Hillside Village Community Evacuation', 'Wildfire', 'Human Settlement & Safety', 'Critical', 'Immediate', 'Active',
          'Rapidly expanding wildfire perimeter threatening Hillside residential zone. Primary arterial road threatened by smoke and ember storm. [SIMULATED - DEMO DATA]',
          'Partly Threatened', true, 1200, 0, 0, [], ['Substation Alpha', 'Highway Access Corridor'], 1.5,
          121.215, 14.845, 'POLYGON((121.210 14.840, 121.220 14.840, 121.220 14.850, 121.210 14.850, 121.210 14.840))'
        ]
      );

      // I-2: Farm and livestock emergency (High, Hours)
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
          'I-2', 'INC-2026-MVP-2', 'Valley Dairy Farm & Livestock Emergency', 'Wildfire', 'Agriculture & Food Security', 'High', 'Hours', 'Active',
          'Commercial dairy and cattle facility located downstream of wildfire smoke plume. Estimated 3.5 hr safe buffer window before containment breach. [SIMULATED - DEMO DATA]',
          'Open', false, 45, 840, 320.5, [], ['Valley Feed Mill', 'Water Canal Sluice Gate'], 4.2,
          121.225, 14.835, 'POLYGON((121.220 14.830, 121.230 14.830, 121.230 14.840, 121.220 14.840, 121.220 14.830))'
        ]
      );

      // I-3: Wildlife habitat emergency (Medium-High, Hours)
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
          'I-3', 'INC-2026-MVP-3', 'Pine Ridge Wildlife Sanctuary Emergency', 'Wildfire', 'Ecosystem & Biodiversity', 'Medium-High', 'Hours', 'Active',
          'Ecological reserve housing endangered species and wetland nesting grounds. Flank containment firebreak needed. [SIMULATED - DEMO DATA]',
          'Rough Track Only', true, 8, 0, 0, ['Endangered Avian Species', 'Local Amphibians'], ['Ecological Monitoring Station', 'Ranger Outpost 4'], 12.8,
          121.205, 14.855, 'POLYGON((121.200 14.850, 121.210 14.850, 121.210 14.860, 121.200 14.860, 121.200 14.850))'
        ]
      );
`;

const startMarker = '// 2. Insert Authoritative T0 Incidents';
if (c.includes(startMarker)) {
  const insertIndex = c.indexOf(startMarker) + startMarker.length;
  c = c.substring(0, insertIndex) + '\n' + mvpIncidents + c.substring(insertIndex);
  fs.writeFileSync('server/db/seed.ts', c);
  console.log('Restored MVP incidents!');
} else {
  console.log('Could not find marker.');
}
