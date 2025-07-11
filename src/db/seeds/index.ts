import { seedPermissions } from './permissions';
import { seedUsers } from './users';
import logger from '../../utils/logger';

const seedAll = async (): Promise<void> => {
  try {
    logger.info('Starting database seeding...');

    await seedPermissions();
    await seedUsers();

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  }
};

if (require.main === module) {
  seedAll()
    .then(() => {
      logger.info('All seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedAll, seedPermissions, seedUsers };