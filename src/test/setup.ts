import { config } from 'dotenv';
import { db, closeConnection } from '../db/connection';
import { seedPermissions } from '../db/seeds/permissions';
import { seedUsers } from '../db/seeds/users';
import { users, permissions, rolePermissions, userPermissions, refreshTokens } from '../db/schema';

config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long';
process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/testdb';

beforeAll(async () => {
  console.log('Setting up test environment');
});

beforeEach(async () => {
  try {
    // Clean all tables before seeding
    await db.delete(userPermissions);
    await db.delete(rolePermissions);
    await db.delete(refreshTokens);
    await db.delete(users);
    await db.delete(permissions);
    
    // Seed the database with test data
    await seedPermissions();
    await seedUsers();
  } catch (error) {
    console.error('Error setting up test database:', error);
  }
});

afterAll(async () => {
  console.log('Cleaning up test environment');
  try {
    await closeConnection();
    console.log('Test database cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }
});