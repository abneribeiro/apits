import { db } from '../connection';
import { users } from '../schema';
import { hashPassword } from '../../utils/bcrypt';
import logger from '../../utils/logger';

const defaultUsers = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'admin@example.com',
    username: 'admin',
    password: 'Password123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const,
    isActive: true,
    isEmailVerified: true,
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'user' as const,
    isActive: true,
    isEmailVerified: true,
  },
  {
    email: 'moderator@example.com',
    username: 'moderator',
    password: 'Password123!',
    firstName: 'Moderator',
    lastName: 'User',
    role: 'moderator' as const,
    isActive: true,
    isEmailVerified: true,
  },
  {
    email: 'user@example.com',
    username: 'user',
    password: 'Password123!',
    firstName: 'Regular',
    lastName: 'User',
    role: 'user' as const,
    isActive: true,
    isEmailVerified: true,
  },
];

export const seedUsers = async (): Promise<void> => {
  try {
    logger.info('Starting users seeding...');

    for (const userData of defaultUsers) {
      const hashedPassword = await hashPassword(userData.password);
      await db.insert(users).values({
        ...userData,
        password: hashedPassword,
      }).onConflictDoNothing();
    }

    logger.info(`Created ${defaultUsers.length} users`);
    logger.info('Users seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding users:', error);
    throw error;
  }
};

if (require.main === module) {
  seedUsers()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}