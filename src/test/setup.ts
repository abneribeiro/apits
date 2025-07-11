import { config } from 'dotenv';

config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

beforeAll(() => {
  console.log('Setting up test environment');
});

afterAll(() => {
  console.log('Cleaning up test environment');
});