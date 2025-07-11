import { z } from 'zod';

export const basePaginationSchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0, 'Page must be greater than 0').default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100').default('10'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const createPaginationSchema = (orderByOptions: string[], defaultOrderBy: string = 'createdAt') => {
  return basePaginationSchema.extend({
    orderBy: z.enum([defaultOrderBy, ...orderByOptions.filter(opt => opt !== defaultOrderBy)] as [string, ...string[]]).default(defaultOrderBy),
  });
};