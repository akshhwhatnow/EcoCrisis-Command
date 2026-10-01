-- ECOCRISIS COMMAND â€” POSTGRESQL + POSTGIS CORE SCHEMA
-- Authoritative Reference: GATEWAYS 2026 Round 1 Specification

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Clean Existing Tables (For Idempotent Migration Execution)
DROP TABLE IF EXISTS audit_events CASCADE;
DROP TABLE IF EXISTS approval_decisions CASCADE;
DROP TABLE IF EXISTS agent_findings CASCADE;
DROP TABLE IF EXISTS agent_runs CASCADE;
DROP TABLE IF EXISTS plan_changes CASCADE;
DROP TABLE IF EXISTS plan_assignments CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS resource_assignments CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS incident_dependencies CASCADE;
DROP TABLE IF EXISTS incident_events CASCADE;
DROP TABLE IF EXISTS spatial_layers CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;

-- 3. Incidents Table
CREATE TABLE incidents (
    id VARCHAR(64) PRIMARY KEY,
    external_ref VARCHAR(128),
    name VARCHAR(255) NOT NULL,
    incident_type VARCHAR(128) NOT NULL,
    sector VARCHAR(128) NOT NULL,
    severity VARCHAR(32) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium-High', 'Medium', 'Low')),
    urgency VARCHAR(32) NOT NULL CHECK (urgency IN ('Immediate', 'Hours', 'Monitoring')),
    status VARCHAR(32) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Contained', 'Escalating', 'Delayed', 'Resolved')),
    description TEXT,
    accessibility_status VARCHAR(64) NOT NULL DEFAULT 'Open',
    river_route_available BOOLEAN NOT NULL DEFAULT FALSE,
    impact_people_at_risk INTEGER NOT NULL DEFAULT 0,
    impact_livestock_count INTEGER NOT NULL DEFAULT 0,
    impact_crop_hectares NUMERIC(10, 2) NOT NULL DEFAULT 0,
    impact_wildlife_species TEXT[] NOT NULL DEFAULT '{}',
    impact_infrastructure_risk TEXT[] NOT NULL DEFAULT '{}',
    impact_habitat_area_km2 NUMERIC(10, 2) NOT NULL DEFAULT 0,
    location_geom geometry(Point, 4326) NOT NULL,
    perimeter_geom geometry(Polygon, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Incident Events Table (Dynamic incident timeline & triggers)
CREATE TABLE incident_events (
    id SERIAL PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    severity VARCHAR(32),
    description TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4b. Incident Dependencies Table (Causal Failure & Cascading Risk DAG)
CREATE TABLE incident_dependencies (
    id VARCHAR(64) PRIMARY KEY,
    source_incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    target_incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    dependency_type VARCHAR(64) NOT NULL CHECK (dependency_type IN ('AccessBlockage', 'ThreatSpread', 'ResourceDrain', 'InfrastructureFailure', 'CascadingRisk')),
    severity VARCHAR(32) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    description TEXT NOT NULL,
    provenance VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_no_self_dependency CHECK (source_incident_id <> target_incident_id),
    UNIQUE(source_incident_id, target_incident_id, dependency_type)
);

-- 5. Resources Table
CREATE TABLE resources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'En Route', 'On Scene', 'Unavailable', 'Maintenance')),
    capabilities TEXT[] NOT NULL DEFAULT '{}',
    capacity_people INTEGER NOT NULL DEFAULT 0,
    capacity_cargo_tons NUMERIC(8, 2) NOT NULL DEFAULT 0,
    speed_kmh NUMERIC(6, 2) NOT NULL DEFAULT 50,
    location_geom geometry(Point, 4326) NOT NULL,
    home_station_geom geometry(Point, 4326),
    operational_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Plans Table
CREATE TABLE plans (
    id VARCHAR(64) PRIMARY KEY,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending Approval', 'Approved', 'Active', 'Superseded', 'Rejected')),
    source_scenario VARCHAR(64) NOT NULL DEFAULT 'T0',
    confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    objective_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Plan Assignments Table (Resource-to-incident allocations per plan version)
CREATE TABLE plan_assignments (
    id SERIAL PRIMARY KEY,
    plan_id VARCHAR(64) NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    resource_id VARCHAR(64) NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE RESTRICT,
    action VARCHAR(32) NOT NULL DEFAULT 'Assign' CHECK (action IN ('Assign', 'Reallocate', 'Standby', 'Release')),
    eta_minutes INTEGER NOT NULL DEFAULT 0,
    route_details TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(plan_id, resource_id)
);

-- 8. Plan Changes Table (Plan Diff Itemization)
CREATE TABLE plan_changes (
    id SERIAL PRIMARY KEY,
    plan_id VARCHAR(64) NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    change_type VARCHAR(32) NOT NULL CHECK (change_type IN ('added', 'reallocated', 'delayed', 'removed', 'preserved')),
    resource_id VARCHAR(64),
    resource_name VARCHAR(255),
    previous_assignment VARCHAR(255),
    new_assignment VARCHAR(255),
    reason TEXT NOT NULL,
    consequence TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Resource Assignments Table (Runtime & Historical Execution Tracking)
CREATE TABLE resource_assignments (
    id SERIAL PRIMARY KEY,
    resource_id VARCHAR(64) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    plan_id VARCHAR(64) REFERENCES plans(id) ON DELETE SET NULL,
    state VARCHAR(32) NOT NULL DEFAULT 'Active' CHECK (state IN ('Assigned', 'Active', 'Completed', 'Cancelled')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    released_at TIMESTAMPTZ,
    reason TEXT
);

-- 10. Agent Runs Table (Preparation for 8 Agent Roles)
CREATE TABLE agent_runs (
    id VARCHAR(64) PRIMARY KEY,
    plan_id VARCHAR(64) REFERENCES plans(id) ON DELETE CASCADE,
    agent_role VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Completed' CHECK (status IN ('Pending', 'Running', 'Completed', 'Failed')),
    confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    inputs_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    outputs_metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 11. Agent Findings Table
CREATE TABLE agent_findings (
    id SERIAL PRIMARY KEY,
    agent_run_id VARCHAR(64) NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
    finding_type VARCHAR(128) NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence_references TEXT[] NOT NULL DEFAULT '{}',
    recommendations TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Approval Decisions Table (Human-in-the-Loop Gating)
CREATE TABLE approval_decisions (
    id SERIAL PRIMARY KEY,
    plan_id VARCHAR(64) NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    decision VARCHAR(32) NOT NULL CHECK (decision IN ('Approved', 'Edited', 'Rejected', 'ReAnalysisRequested')),
    actor_id VARCHAR(128) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    rationale TEXT NOT NULL,
    modifications_payload JSONB,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Audit Events Table (Persistent Auditable Event History)
CREATE TABLE audit_events (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_system VARCHAR(128) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    action VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    correlation_id VARCHAR(128)
);

-- 14. Spatial Layers Table (Agriculture, Wildlife, Infrastructure, Hazard, Routes)
CREATE TABLE spatial_layers (
    id VARCHAR(64) PRIMARY KEY,
    layer_type VARCHAR(64) NOT NULL CHECK (layer_type IN ('agriculture', 'wildlife', 'infrastructure', 'hazard', 'route')),
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(64) NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    geom geometry(Geometry, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Spatial Indexes (GiST)
CREATE INDEX idx_incidents_location_geom ON incidents USING GIST(location_geom);
CREATE INDEX idx_incidents_perimeter_geom ON incidents USING GIST(perimeter_geom);
CREATE INDEX idx_resources_location_geom ON resources USING GIST(location_geom);
CREATE INDEX idx_spatial_layers_geom ON spatial_layers USING GIST(geom);

-- 16. Relational Indexes
CREATE INDEX idx_incident_events_incident ON incident_events(incident_id);
CREATE INDEX idx_incident_deps_source ON incident_dependencies(source_incident_id);
CREATE INDEX idx_incident_deps_target ON incident_dependencies(target_incident_id);
CREATE INDEX idx_plan_assignments_plan ON plan_assignments(plan_id);
CREATE INDEX idx_plan_assignments_resource ON plan_assignments(resource_id);
CREATE INDEX idx_plan_assignments_incident ON plan_assignments(incident_id);
CREATE INDEX idx_plan_changes_plan ON plan_changes(plan_id);
CREATE INDEX idx_agent_runs_plan ON agent_runs(plan_id);
CREATE INDEX idx_agent_findings_run ON agent_findings(agent_run_id);
CREATE INDEX idx_approval_decisions_plan ON approval_decisions(plan_id);
CREATE INDEX idx_audit_events_timestamp ON audit_events(timestamp);
CREATE INDEX idx_audit_events_correlation ON audit_events(correlation_id);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    operator_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Active'
);
