import { pool, withTransaction } from './pool.js';
import { fileURLToPath } from 'url';

export async function runSeed(): Promise<void> {
  console.log('🌱 Starting T0 Baseline Scenario Seed...');

  await withTransaction(async (client) => {
    // 1. Clear previous operational seed records
    await client.query('DELETE FROM audit_events;');
    await client.query('DELETE FROM approval_decisions;');
    await client.query('DELETE FROM agent_findings;');
    await client.query('DELETE FROM agent_runs;');
    await client.query('DELETE FROM plan_changes;');
    await client.query('DELETE FROM plan_assignments;');
    await client.query('DELETE FROM plans;');
    await client.query('DELETE FROM resource_assignments;');
    await client.query('DELETE FROM resources;');
    await client.query('DELETE FROM incident_dependencies;');
    await client.query('DELETE FROM incident_events;');
    await client.query('DELETE FROM spatial_layers;');
    await client.query('DELETE FROM incidents;');

    // 2. Insert Authoritative T0 Incidents

      // --- MVP DEMONSTRATION SCENARIO INCIDENTS ---
      // I-1: Community evacuation (Critical, Immediate)
      await client.query(
        'INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))',
        [
          'I-1', 'INC-2026-MVP-1', 'Community Evacuation', 'Wildfire', 'Human Settlement & Safety', 'Critical', 'Immediate', 'Active',
          'Rapidly expanding wildfire perimeter threatening Hillside residential zone. Primary arterial road threatened by smoke and ember storm. [SIMULATED - DEMO DATA]',
          'Partly Threatened', true, 1200, 0, 0, [], ['Substation Alpha', 'Highway Access Corridor'], 1.5,
          121.215, 14.845, 'POLYGON((121.210 14.840, 121.220 14.840, 121.220 14.850, 121.210 14.850, 121.210 14.840))'
        ]
      );

      // I-2: Farm and livestock emergency (High, Hours)
      await client.query(
        'INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))',
        [
          'I-2', 'INC-2026-MVP-2', 'Farm and Livestock Emergency', 'Wildfire', 'Agriculture & Food Security', 'High', 'Hours', 'Active',
          'Commercial dairy and cattle facility located downstream of wildfire smoke plume. Estimated 3.5 hr safe buffer window before containment breach. [SIMULATED - DEMO DATA]',
          'Open', false, 45, 840, 320.5, [], ['Valley Feed Mill', 'Water Canal Sluice Gate'], 4.2,
          121.225, 14.835, 'POLYGON((121.220 14.830, 121.230 14.830, 121.230 14.840, 121.220 14.840, 121.220 14.830))'
        ]
      );

      // I-3: Wildlife habitat emergency (Medium-High, Hours)
      await client.query(
        'INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))',
        [
          'I-3', 'INC-2026-MVP-3', 'Wildlife Habitat Emergency', 'Wildfire', 'Ecosystem & Biodiversity', 'Medium-High', 'Hours', 'Active',
          'Ecological reserve housing endangered species and wetland nesting grounds. Flank containment firebreak needed. [SIMULATED - DEMO DATA]',
          'Rough Track Only', true, 8, 0, 0, ['Endangered Avian Species', 'Local Amphibians'], ['Ecological Monitoring Station', 'Ranger Outpost 4'], 12.8,
          121.205, 14.855, 'POLYGON((121.200 14.850, 121.210 14.850, 121.210 14.860, 121.200 14.860, 121.200 14.850))'
        ]
      );

await client.query('INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))', ['I-11', 'INC-2026-GLB-1', 'San Mateo Forest Fire', 'Wildfire', 'General', 'Critical', 'Immediate', 'Active', 'Rapidly expanding wildfire perimeter threatening residential zones.', 'Open', true, 1200, 0, 0, [], [], 0, 121.115, 14.745, 'POLYGON((121.10499999999999 14.735, 121.125 14.735, 121.125 14.754999999999999, 121.10499999999999 14.754999999999999, 121.10499999999999 14.735))']);
await client.query('INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))', ['I-12', 'INC-2026-GLB-2', 'Yamuna River Overflow', 'Severe Flood Alert', 'General', 'High', 'Immediate', 'Active', 'Heavy monsoon rains causing river overflow and urban flooding.', 'Open', true, 8500, 0, 0, [], [], 0, 77.209, 28.6139, 'POLYGON((77.199 28.6039, 77.21900000000001 28.6039, 77.21900000000001 28.623900000000003, 77.199 28.623900000000003, 77.199 28.6039))']);
await client.query('INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))', ['I-13', 'INC-2026-GLB-3', 'Typhoon Hagibis Approach', 'Typhoon / Cyclone Warning', 'General', 'Critical', 'Immediate', 'Active', 'Category 5 storm approaching the metropolitan area.', 'Open', true, 50000, 0, 0, [], [], 0, 139.6917, 35.6895, 'POLYGON((139.6817 35.679500000000004, 139.7017 35.679500000000004, 139.7017 35.6995, 139.6817 35.6995, 139.6817 35.679500000000004))']);
await client.query('INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))', ['I-14', 'INC-2026-GLB-4', 'Mount Merapi Activity', 'Volcanic Eruption Risk', 'General', 'High', 'Immediate', 'Active', 'Increased seismic activity and ash plumes detected.', 'Open', true, 4000, 0, 0, [], [], 0, 110.4427, -7.5361, 'POLYGON((110.4327 -7.5461, 110.45270000000001 -7.5461, 110.45270000000001 -7.5261000000000005, 110.4327 -7.5261000000000005, 110.4327 -7.5461))']);
await client.query('INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))', ['I-15', 'INC-2026-GLB-5', 'Port Hazardous Leak', 'Industrial Chemical Spill', 'General', 'Critical', 'Immediate', 'Active', 'Toxic chemical leak from industrial container ship.', 'Open', true, 2100, 0, 0, [], [], 0, 121.4737, 31.2304, 'POLYGON((121.46369999999999 31.220399999999998, 121.4837 31.220399999999998, 121.4837 31.2404, 121.46369999999999 31.2404, 121.46369999999999 31.220399999999998))']);
await client.query('INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))', ['I-16', 'INC-2026-GLB-6', 'Cholera Outbreak Zone', 'Medical Emergency Cluster', 'General', 'High', 'Immediate', 'Active', 'Sudden spike in acute medical emergencies in dense sectors.', 'Open', true, 1500, 0, 0, [], [], 0, 90.4125, 23.8103, 'POLYGON((90.40249999999999 23.8003, 90.4225 23.8003, 90.4225 23.820300000000003, 90.40249999999999 23.820300000000003, 90.40249999999999 23.8003))']);
await client.query('INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))', ['I-17', 'INC-2026-GLB-7', 'Sindh Heat Dome', 'Extreme Heat Wave', 'General', 'Medium-High', 'Immediate', 'Active', 'Temperatures exceeding 48C causing widespread grid failure.', 'Open', true, 25000, 0, 0, [], [], 0, 67.0011, 24.8607, 'POLYGON((66.99109999999999 24.8507, 67.0111 24.8507, 67.0111 24.870700000000003, 66.99109999999999 24.870700000000003, 66.99109999999999 24.8507))']);
await client.query('INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))', ['I-18', 'INC-2026-GLB-8', 'Marmaray Tunnel Breach', 'Structural Infrastructure Collapse', 'General', 'Critical', 'Immediate', 'Active', 'Major structural failure in underground transit infrastructure.', 'Open', true, 800, 0, 0, [], [], 0, 28.9784, 41.0082, 'POLYGON((28.9684 40.998200000000004, 28.988400000000002 40.998200000000004, 28.988400000000002 41.0182, 28.9684 41.0182, 28.9684 40.998200000000004))']);
await client.query('INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))', ['I-19', 'INC-2026-GLB-9', 'Red River Delta Surge', 'Coastal Flood Emergency', 'General', 'Medium-High', 'Immediate', 'Active', 'Coastal tidal surge overwhelming local water defenses.', 'Open', true, 3400, 0, 0, [], [], 0, 105.8342, 21.0278, 'POLYGON((105.82419999999999 21.017799999999998, 105.8442 21.017799999999998, 105.8442 21.0378, 105.82419999999999 21.0378, 105.82419999999999 21.017799999999998))']);
await client.query('INSERT INTO incidents (id, external_ref, name, incident_type, sector, severity, urgency, status, description, accessibility_status, river_route_available, impact_people_at_risk, impact_livestock_count, impact_crop_hectares, impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2, location_geom, perimeter_geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($18, $19), 4326), ST_SetSRID(ST_GeomFromText($20), 4326))', ['I-20', 'INC-2026-GLB-10', 'Blue Mountains Blaze', 'Bushfire Emergency', 'General', 'High', 'Immediate', 'Active', 'Uncontrolled bushfires threatening suburban outskirts.', 'Open', true, 600, 0, 0, [], [], 0, 151.2093, -33.8688, 'POLYGON((151.19930000000002 -33.8788, 151.2193 -33.8788, 151.2193 -33.8588, 151.19930000000002 -33.8588, 151.19930000000002 -33.8788))']);

    // 3. Insert Authoritative Resources
    // Vehicle A
    await client.query(
      `INSERT INTO resources (
        id, name, resource_type, status, capabilities, capacity_people, capacity_cargo_tons, speed_kmh, location_geom
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        ST_SetSRID(ST_MakePoint($9, $10), 4326)
      )`,
      [
        'RES-VEH-A',
        'Evacuation Vehicle A',
        'Evacuation Vehicle',
        'Available',
        ['High-Capacity Transit', 'Medical Triage Unit', 'Wheelchair Access'],
        45,
        2.5,
        60,
        -122.415,
        37.77,
      ]
    );

    // Transport Team B
    await client.query(
      `INSERT INTO resources (
        id, name, resource_type, status, capabilities, capacity_people, capacity_cargo_tons, speed_kmh, location_geom
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        ST_SetSRID(ST_MakePoint($9, $10), 4326)
      )`,
      [
        'RES-TEAM-B',
        'Transport Team B',
        'Transport Team',
        'Available',
        ['6x6 Heavy Transport', 'Livestock Containment Trailer', 'Off-Road Capability', 'Bridge Bypass'],
        12,
        18.0,
        50,
        -122.43,
        37.76,
      ]
    );

    // Rescue Team C
    await client.query(
      `INSERT INTO resources (
        id, name, resource_type, status, capabilities, capacity_people, capacity_cargo_tons, speed_kmh, location_geom
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        ST_SetSRID(ST_MakePoint($9, $10), 4326)
      )`,
      [
        'RES-TEAM-C',
        'Rescue Team C',
        'Rescue Team',
        'Available',
        ['Wildlife Handling', 'Ground Firebreak Construction', 'Wilderness Search & Rescue', 'First Aid'],
        8,
        4.0,
        45,
        -122.445,
        37.775,
      ]
    );

    // Boat 1
    await client.query(
      `INSERT INTO resources (
        id, name, resource_type, status, capabilities, capacity_people, capacity_cargo_tons, speed_kmh, location_geom
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        ST_SetSRID(ST_MakePoint($9, $10), 4326)
      )`,
      [
        'RES-BOAT-1',
        'Boat 1',
        'Boat',
        'Available',
        ['Waterway Evacuation', 'Amphibious Extraction', 'River Patrol', 'Flood Navigation'],
        25,
        3.0,
        35,
        -122.41,
        37.772,
      ]
    );

    // 4. Insert Spatial Layers (Agriculture, Wildlife, Infrastructure, Hazard)
    await client.query(
      `INSERT INTO spatial_layers (id, layer_type, name, sector, properties, geom) VALUES
      (
        'LAYER-AGRI-01',
        'agriculture',
        'Valley Agricultural Preservation Parcel',
        'Agriculture',
        '{"cropType": "Dairy Pasture & Vineyards", "bufferHours": 3.5, "economicValueUSD": 2980000}'::jsonb,
        ST_SetSRID(ST_GeomFromText('POLYGON((-122.442 37.758, -122.428 37.758, -122.428 37.772, -122.442 37.772, -122.442 37.758))'), 4326)
      ),
      (
        'LAYER-WILD-01',
        'wildlife',
        'Pine Ridge Biodiversity Corridor',
        'Wildlife',
        '{"status": "Protected Ecological Habitat", "primarySpecies": "Roosevelt Elk", "priority": "High"}'::jsonb,
        ST_SetSRID(ST_GeomFromText('POLYGON((-122.465 37.770, -122.440 37.770, -122.440 37.795, -122.465 37.795, -122.465 37.770))'), 4326)
      ),
      (
        'LAYER-HAZARD-01',
        'hazard',
        'Pine Ridge Fire Perimeter & Smoke Buffer',
        'Hazard',
        '{"spreadRateKmh": 2.4, "windDirection": "SSE", "intensity": "Severe"}'::jsonb,
        ST_SetSRID(ST_GeomFromText('POLYGON((-122.455 37.768, -122.420 37.768, -122.420 37.788, -122.455 37.788, -122.455 37.768))'), 4326)
      )`
    );

    // 5. Insert Authoritative T0 Baseline Plan
    // Plan metadata
    await client.query(
      `INSERT INTO plans (
        id, version, status, source_scenario, confidence_score, objective_score, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )`,
      [
        'PLAN-T0-BASE',
        1,
        'Active',
        'T0',
        94.5,
        100.0,
        JSON.stringify({
          description: 'Authoritative T0 Baseline Multi-Incident Resource Allocation Plan',
          generatedBy: 'Multi-Agent AI Pipeline + Deterministic Optimization Engine',
        }),
      ]
    );

    // T0 Plan Assignments:
    // Vehicle A -> I-1
    // Transport Team B -> I-2
    // Rescue Team C -> I-3
    // Boat 1 -> I-1
    const t0Assignments = [
      {
        resourceId: 'RES-VEH-A',
        incidentId: 'I-1',
        action: 'Assign',
        eta: 8,
        route: 'Highway 101 Corridor direct to Hillside Center',
        notes: 'Primary rapid mass transit evacuation for direct fire threat.',
      },
      {
        resourceId: 'RES-TEAM-B',
        incidentId: 'I-2',
        action: 'Assign',
        eta: 14,
        route: 'Valley Road South to Dairy Pastures',
        notes: 'Livestock hauler and herd containment staging.',
      },
      {
        resourceId: 'RES-TEAM-C',
        incidentId: 'I-3',
        action: 'Assign',
        eta: 18,
        route: 'Ridge Access Fire Trail',
        notes: 'Ground firebreak creation and wildlife monitoring.',
      },
      {
        resourceId: 'RES-BOAT-1',
        incidentId: 'I-1',
        action: 'Assign',
        eta: 10,
        route: 'Navigable River Channel Marina to Hillside Riverside',
        notes: 'Water-based perimeter evacuation support.',
      },
    ];

    for (const a of t0Assignments) {
      await client.query(
        `INSERT INTO plan_assignments (
          plan_id, resource_id, incident_id, action, eta_minutes, route_details, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['PLAN-T0-BASE', a.resourceId, a.incidentId, a.action, a.eta, a.route, a.notes]
      );

      await client.query(
        `INSERT INTO resource_assignments (
          resource_id, incident_id, plan_id, state, reason
        ) VALUES ($1, $2, $3, $4, $5)`,
        [a.resourceId, a.incidentId, 'PLAN-T0-BASE', 'Assigned', a.notes]
      );
    }

    // 5b. Insert Initial Incident Dependencies (DAG Causal Failure Links)
    const seedDependencies = [
      {
        id: 'DEP-001',
        source: 'I-1',
        target: 'I-2',
        type: 'ThreatSpread',
        severity: 'High',
        description: 'Wildfire smoke and PM2.5 plume from Hillside Village drifts toward Valley Dairy Farm.',
        provenance: '[SIMULATED — DEMO DATA]',
      },
      {
        id: 'DEP-002',
        source: 'I-1',
        target: 'I-3',
        type: 'ThreatSpread',
        severity: 'Medium',
        description: 'Wildfire eastern flank approaches Pine Ridge Wildlife Sanctuary habitat perimeter.',
        provenance: '[SIMULATED — DEMO DATA]',
      },
    ];

    for (const d of seedDependencies) {
      await client.query(
        `INSERT INTO incident_dependencies (
          id, source_incident_id, target_incident_id, dependency_type, severity, description, provenance
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING;`,
        [d.id, d.source, d.target, d.type, d.severity, d.description, d.provenance]
      );
    }

    // 6. Insert Initial Persistent Audit Event
    await client.query(
      `INSERT INTO audit_events (
        actor_system, event_type, entity_type, entity_id, action, payload, correlation_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'Multi-Incident Coordinator',
        'SCENARIO_INITIALIZED',
        'Plan',
        'PLAN-T0-BASE',
        'INITIALIZE_T0_BASELINE',
        JSON.stringify({
          activeIncidents: ['I-1', 'I-2', 'I-3'],
          allocatedResources: ['RES-VEH-A', 'RES-TEAM-B', 'RES-TEAM-C', 'RES-BOAT-1'],
          scenario: 'T0 Baseline',
        }),
        'CORR-T0-INIT',
      ]
    );

    console.log('✅ T0 Baseline Scenario Seed completed successfully.');
  });
}

// Direct execution CLI support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Seed failed:', err);
      await pool.end();
      process.exit(1);
    });
}
