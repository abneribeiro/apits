import { z } from 'zod';
import { createPaginationSchema } from './common.validation';

export const createPermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required').max(100, 'Permission name too long'),
  description: z.string().max(255, 'Description too long').nullish(),
  resource: z.string().min(1, 'Resource is required').max(100, 'Resource name too long'),
  action: z.string().min(1, 'Action is required').max(100, 'Action name too long'),
});

export const updatePermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required').max(100, 'Permission name too long').optional(),
  description: z.string().max(255, 'Description too long').nullish(),
  resource: z.string().min(1, 'Resource is required').max(100, 'Resource name too long').optional(),
  action: z.string().min(1, 'Action is required').max(100, 'Action name too long').optional(),
});

export const assignRolePermissionSchema = z.object({
  role: z.enum(['admin', 'user', 'moderator']),
  permissionId: z.string().uuid('Invalid permission ID'),
});

export const assignUserPermissionSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  permissionId: z.string().uuid('Invalid permission ID'),
});

export const paginationSchema = createPaginationSchema(['updatedAt', 'name'], 'createdAt');

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type AssignRolePermissionInput = z.infer<typeof assignRolePermissionSchema>;
export type AssignUserPermissionInput = z.infer<typeof assignUserPermissionSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;