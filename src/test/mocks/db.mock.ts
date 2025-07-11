import { User } from '../../db/schema';
import { PaginationOptions, PaginatedResponse } from '../../types';

const mockUsers: User[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$10$N9qo8uLOickgx2ZMRZoMye5/GkVvGfaQnLwMj5rVZwgKmjyWjJqkO', // Password123!
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isActive: true,
    isEmailVerified: true,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'admin@example.com',
    username: 'adminuser',
    password: '$2b$10$N9qo8uLOickgx2ZMRZoMye5/GkVvGfaQnLwMj5rVZwgKmjyWjJqkO', // Password123!
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    isEmailVerified: true,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockUserRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  existsByEmail: jest.fn(),
  existsByUsername: jest.fn(),
  updateLastLogin: jest.fn(),
  deactivateUser: jest.fn(),
  activateUser: jest.fn(),
};

export const mockPermissionRepository = {
  checkPermission: jest.fn(),
  findUserAllPermissions: jest.fn(),
};

export const mockRefreshTokenRepository = {
  create: jest.fn(),
  findByToken: jest.fn(),
  deleteByUserId: jest.fn(),
};