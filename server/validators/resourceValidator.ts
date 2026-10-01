import { z } from 'zod';

export const updateResourceStatusSchema = z.object({
  status: z.enum(['Available', 'En Route', 'On Scene', 'Unavailable', 'Maintenance']),
});

export const resourceQuerySchema = z.object({
  status: z.enum(['Available', 'En Route', 'On Scene', 'Unavailable', 'Maintenance']).optional(),
  type: z.string().optional(),
});
