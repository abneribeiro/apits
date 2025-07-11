import { eq, and, count, desc, asc } from 'drizzle-orm';
import { db } from '../db/connection';
import { permissions, rolePermissions, userPermissions, Permission, NewPermission, RolePermission, NewRolePermission, UserPermission, NewUserPermission } from '../db/schema';
import { PaginationOptions, PaginatedResponse } from '../types';

export class PermissionRepository {
  async create(permissionData: NewPermission): Promise<Permission> {
    const [permission] = await db.insert(permissions).values(permissionData).returning();
    if (!permission) throw new Error('Failed to create permission');
    return permission;
  }

  async findById(id: string): Promise<Permission | null> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission || null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.name, name));
    return permission || null;
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResponse<Permission>> {
    const { page, limit, orderBy = 'createdAt', order = 'desc' } = options;
    const offset = (page - 1) * limit;

    const orderDirection = order === 'asc' ? asc : desc;
    let orderColumn;
    switch (orderBy) {
      case 'updatedAt':
        orderColumn = permissions.updatedAt;
        break;
      case 'name':
        orderColumn = permissions.name;
        break;
      default:
        orderColumn = permissions.createdAt;
    }

    const [totalResult] = await db.select({ count: count() }).from(permissions);
    const total = totalResult?.count || 0;

    const data = await db
      .select()
      .from(permissions)
      .orderBy(orderDirection(orderColumn))
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, permissionData: Partial<NewPermission>): Promise<Permission | null> {
    const [permission] = await db
      .update(permissions)
      .set({ ...permissionData, updatedAt: new Date() })
      .where(eq(permissions.id, id))
      .returning();
    return permission || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(permissions).where(eq(permissions.id, id));
    return (result.rowCount || 0) > 0;
  }

  async assignRolePermission(rolePermissionData: NewRolePermission): Promise<RolePermission> {
    const [rolePermission] = await db.insert(rolePermissions).values(rolePermissionData).returning();
    if (!rolePermission) throw new Error('Failed to assign role permission');
    return rolePermission;
  }

  async revokeRolePermission(role: string, permissionId: string): Promise<boolean> {
    const result = await db
      .delete(rolePermissions)
      .where(and(
        eq(rolePermissions.role, role as any),
        eq(rolePermissions.permissionId, permissionId)
      ));
    return (result.rowCount || 0) > 0;
  }

  async findRolePermissions(role: string): Promise<Permission[]> {
    const result = await db
      .select({
        id: permissions.id,
        name: permissions.name,
        description: permissions.description,
        resource: permissions.resource,
        action: permissions.action,
        createdAt: permissions.createdAt,
        updatedAt: permissions.updatedAt,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.role, role as any));

    return result;
  }

  async assignUserPermission(userPermissionData: NewUserPermission): Promise<UserPermission> {
    const [userPermission] = await db.insert(userPermissions).values(userPermissionData).returning();
    if (!userPermission) throw new Error('Failed to assign user permission');
    return userPermission;
  }

  async revokeUserPermission(userId: string, permissionId: string): Promise<boolean> {
    const result = await db
      .delete(userPermissions)
      .where(and(
        eq(userPermissions.userId, userId),
        eq(userPermissions.permissionId, permissionId)
      ));
    return (result.rowCount || 0) > 0;
  }

  async findUserPermissions(userId: string): Promise<Permission[]> {
    const result = await db
      .select({
        id: permissions.id,
        name: permissions.name,
        description: permissions.description,
        resource: permissions.resource,
        action: permissions.action,
        createdAt: permissions.createdAt,
        updatedAt: permissions.updatedAt,
      })
      .from(userPermissions)
      .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
      .where(eq(userPermissions.userId, userId));

    return result;
  }

  async findUserAllPermissions(userId: string, userRole: string): Promise<Permission[]> {
    const rolePermissionsResult = await this.findRolePermissions(userRole);
    const userPermissionsResult = await this.findUserPermissions(userId);

    const allPermissions = [...rolePermissionsResult, ...userPermissionsResult];
    const uniquePermissions = allPermissions.filter((permission, index, self) => 
      index === self.findIndex(p => p.id === permission.id)
    );

    return uniquePermissions;
  }

  async hasPermission(userId: string, userRole: string, resource: string, action: string): Promise<boolean> {
    const userPermissions = await this.findUserAllPermissions(userId, userRole);
    return userPermissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  }
}