import { db } from '../connection';
import { users } from '../schema';
import { hashPassword } from '../../utils/bcrypt';
import logger from '../../utils/logger';

const defaultUsers = [
  {
    email: 'admin@example.com',
    username: 'admin',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const,
    isActive: true,
    isEmailVerified: true,
  },
  {
    email: 'moderator@example.com',
    username: 'moderator',
    password: 'Moderator123!',
    firstName: 'Moderator',
    lastName: 'User',
    role: 'moderator' as const,
    isActive: true,
    isEmailVerified: true,
  },
  {
    email: 'user@example.com',
    username: 'user',
    password: 'User123!',
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
      });
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