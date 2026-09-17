import { z } from 'zod';

export const createProvinceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100, 'Name must be at most 100 characters long'),
});

export type CreateProvinceInput = z.infer<typeof createProvinceSchema>;

export const provinceQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type ProvinceQuery = z.infer<typeof provinceQuerySchema>;
