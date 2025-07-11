import { db } from '../connection';
import { permissions, rolePermissions } from '../schema';
import logger from '../../utils/logger';

const defaultPermissions = [
  {
    name: 'users.read',
    description: 'Read user information',
    resource: 'users',
    action: 'read',
  },
  {
    name: 'users.write',
    description: 'Create and update users',
    resource: 'users',
    action: 'write',
  },
  {
    name: 'users.delete',
    description: 'Delete users',
    resource: 'users',
    action: 'delete',
  },
  {
    name: 'permissions.read',
    description: 'Read permissions',
    resource: 'permissions',
    action: 'read',
  },
  {
    name: 'permissions.write',
    description: 'Create and update permissions',
    resource: 'permissions',
    action: 'write',
  },
  {
    name: 'permissions.delete',
    description: 'Delete permissions',
    resource: 'permissions',
    action: 'delete',
  },
  {
    name: 'permissions.assign',
    description: 'Assign permissions to roles and users',
    resource: 'permissions',
    action: 'assign',
  },
];

const rolePermissionMappings = {
  admin: [
    'users.read',
    'users.write',
    'users.delete',
    'permissions.read',
    'permissions.write',
    'permissions.delete',
    'permissions.assign',
  ],
  moderator: [
    'users.read',
    'users.write',
    'permissions.read',
  ],
  user: [
    'users.read',
  ],
};

export const seedPermissions = async (): Promise<void> => {
  try {
    logger.info('Starting permissions seeding...');

    // Create permissions
    const createdPermissions = await db.insert(permissions).values(defaultPermissions).returning();
    logger.info(`Created ${createdPermissions.length} permissions`);

    // Create role-permission mappings
    for (const [role, permissionNames] of Object.entries(rolePermissionMappings)) {
      for (const permissionName of permissionNames) {
        const permission = createdPermissions.find((p: any) => p.name === permissionName);
        if (permission) {
          await db.insert(rolePermissions).values({
            role: role as 'admin' | 'moderator' | 'user',
            permissionId: permission.id,
          });
        }
      }
    }

    logger.info('Permissions seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding permissions:', error);
    throw error;
  }
};

if (require.main === module) {
  seedPermissions()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}