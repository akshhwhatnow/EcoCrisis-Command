import { z } from 'zod';

export const createIncidentSchema = z.object({
  id: z.string().min(1, 'Incident ID is required'),
  external_ref: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  incident_type: z.string().min(1, 'Incident type is required'),
  sector: z.string().min(1, 'Sector is required'),
  severity: z.enum(['Critical', 'High', 'Medium-High', 'Medium', 'Low']),
  urgency: z.enum(['Immediate', 'Hours', 'Monitoring']),
  status: z.enum(['Active', 'Contained', 'Escalating', 'Delayed', 'Resolved']).default('Active'),
  description: z.string().default(''),
  accessibility_status: z.string().default('Open'),
  river_route_available: z.boolean().default(false),
  impact_people_at_risk: z.number().int().nonnegative().default(0),
  impact_livestock_count: z.number().int().nonnegative().default(0),
  impact_crop_hectares: z.number().nonnegative().default(0),
  impact_wildlife_species: z.array(z.string()).default([]),
  impact_infrastructure_risk: z.array(z.string()).default([]),
  impact_habitat_area_km2: z.number().nonnegative().default(0),
  lng: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
  perimeterWkt: z.string().optional(),
});

export const updateIncidentSchema = z.object({
  name: z.string().min(1).optional(),
  incident_type: z.string().min(1).optional(),
  sector: z.string().min(1).optional(),
  severity: z.enum(['Critical', 'High', 'Medium-High', 'Medium', 'Low']).optional(),
  urgency: z.enum(['Immediate', 'Hours', 'Monitoring']).optional(),
  status: z.enum(['Active', 'Contained', 'Escalating', 'Delayed', 'Resolved']).optional(),
  description: z.string().optional(),
  accessibility_status: z.string().optional(),
  river_route_available: z.boolean().optional(),
  impact_people_at_risk: z.number().int().nonnegative().optional(),
  impact_livestock_count: z.number().int().nonnegative().optional(),
  impact_crop_hectares: z.number().nonnegative().optional(),
  impact_wildlife_species: z.array(z.string()).optional(),
  impact_infrastructure_risk: z.array(z.string()).optional(),
  impact_habitat_area_km2: z.number().nonnegative().optional(),
});

export const incidentQuerySchema = z.object({
  status: z.enum(['Active', 'Contained', 'Escalating', 'Delayed', 'Resolved']).optional(),
  severity: z.enum(['Critical', 'High', 'Medium-High', 'Medium', 'Low']).optional(),
  urgency: z.enum(['Immediate', 'Hours', 'Monitoring']).optional(),
  radius: z.coerce.number().positive().optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
});
