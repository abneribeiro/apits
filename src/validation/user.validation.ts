import { z } from 'zod';
import { createPaginationSchema } from './common.validation';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(100, 'Username too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long').nullish(),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long').nullish(),
  role: z.enum(['admin', 'user', 'moderator']).default('user'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(100, 'Username too long').optional(),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long').nullish(),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long').nullish(),
  role: z.enum(['admin', 'user', 'moderator']).optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
});

export const paginationSchema = createPaginationSchema(['updatedAt', 'email', 'username'], 'createdAt');

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;