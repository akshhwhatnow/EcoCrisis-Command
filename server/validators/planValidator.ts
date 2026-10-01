import { z } from 'zod';

export const planQuerySchema = z.object({
  status: z.enum(['Draft', 'Pending Approval', 'Approved', 'Active', 'Superseded', 'Rejected']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
