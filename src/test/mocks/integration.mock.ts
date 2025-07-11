import { User } from '../../db/schema';
import { PaginationOptions, PaginatedResponse } from '../../types';

const mockUsers: User[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2a$12$RLfNOhQmkGk8.VEHdUeeWOC2k.7pnLC0kDEUyITGYJiPTdHh8yvWW', // Password123!
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
    password: '$2a$12$RLfNOhQmkGk8.VEHdUeeWOC2k.7pnLC0kDEUyITGYJiPTdHh8yvWW', // Password123!
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

export const integrationMockUserRepository = {
  async findById(id: string): Promise<User | null> {
    return mockUsers.find(user => user.id === id) || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    return mockUsers.find(user => user.email === email) || null;
  },

  async create(userData: any): Promise<User> {
    const newUser: User = {
      id: `new-user-${Date.now()}`,
      email: userData.email,
      username: userData.username,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'user',
      isActive: true,
      isEmailVerified: false,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsers.push(newUser);
    return newUser;
  },

  async findAll(options: PaginationOptions): Promise<PaginatedResponse<User>> {
    const { page, limit } = options;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = mockUsers.slice(startIndex, endIndex);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total: mockUsers.length,
        pages: Math.ceil(mockUsers.length / limit),
      },
    };
  },

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData, updatedAt: new Date() };
    return mockUsers[userIndex];
  },

  async delete(id: string): Promise<boolean> {
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    mockUsers.splice(userIndex, 1);
    return true;
  },

  async existsByEmail(email: string): Promise<boolean> {
    return mockUsers.some(user => user.email === email);
  },

  async existsByUsername(username: string): Promise<boolean> {
    return mockUsers.some(user => user.username === username);
  },

  async updateLastLogin(id: string): Promise<void> {
    const user = mockUsers.find(user => user.id === id);
    if (user) {
      user.lastLogin = new Date();
      user.updatedAt = new Date();
    }
  },

  async deactivateUser(id: string): Promise<User | null> {
    const user = mockUsers.find(user => user.id === id);
    if (user) {
      user.isActive = false;
      user.updatedAt = new Date();
      return user;
    }
    return null;
  },

  async activateUser(id: string): Promise<User | null> {
    const user = mockUsers.find(user => user.id === id);
    if (user) {
      user.isActive = true;
      user.updatedAt = new Date();
      return user;
    }
    return null;
  },
};

export const integrationMockPermissionRepository = {
  async checkPermission(): Promise<boolean> {
    return true;
  },
  
  async findUserAllPermissions(userId: string, role: string): Promise<{ name: string }[]> {
    if (role === 'admin') {
      return [
        { name: 'users:read' },
        { name: 'users:write' },
        { name: 'users:delete' },
        { name: 'permissions:read' },
        { name: 'permissions:write' },
        { name: 'permissions:delete' },
      ];
    }
    return [
      { name: 'profile:read' },
      { name: 'profile:write' },
    ];
  },
};

export const integrationMockRefreshTokenRepository = {
  async create(data: any): Promise<void> {
    // Mock implementation
  },
  
  async findByToken(token: string): Promise<any> {
    return null;
  },
  
  async deleteByUserId(userId: string): Promise<void> {
    // Mock implementation
  },
};