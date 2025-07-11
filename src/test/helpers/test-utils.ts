import { generateToken } from '../../utils/jwt';
import { User } from '../../db/schema';

export const createTestUser = (overrides?: Partial<User>): User => {
  const now = new Date();
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isActive: true,
    isEmailVerified: true,
    lastLogin: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

export const createTestToken = (userId: string = '123e4567-e89b-12d3-a456-426614174000', role: string = 'user'): string => {
  return generateToken({
    userId,
    email: 'test@example.com',
    role,
  });
};

export const createAdminToken = (): string => {
  return generateToken({
    userId: '123e4567-e89b-12d3-a456-426614174001',
    email: 'admin@example.com',
    role: 'admin',
  });
};