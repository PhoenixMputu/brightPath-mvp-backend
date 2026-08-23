import { z } from 'zod';

export const createProvinceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100, 'Name must be at most 100 characters long'),
});

export type CreateProvinceInput = z.infer<typeof createProvinceSchema>;
