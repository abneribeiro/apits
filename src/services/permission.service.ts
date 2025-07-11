import { PermissionRepository } from '../repositories/permission.repository';
import { CreatePermissionInput, UpdatePermissionInput, AssignRolePermissionInput, AssignUserPermissionInput, PaginationInput } from '../validation/permission.validation';
import { PaginatedResponse } from '../types';
import { Permission } from '../db/schema';
import logger from '../utils/logger';

export class PermissionService {
  private permissionRepository: PermissionRepository;

  constructor() {
    this.permissionRepository = new PermissionRepository();
  }

  async createPermission(permissionData: CreatePermissionInput): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findByName(permissionData.name);
    if (existingPermission) {
      throw new Error('Permission with this name already exists');
    }

    const cleanPermissionData = {
      name: permissionData.name,
      description: permissionData.description || null,
      resource: permissionData.resource,
      action: permissionData.action,
    };
    const permission = await this.permissionRepository.create(cleanPermissionData);
    logger.info(`Permission created successfully: ${permission.name}`);
    return permission;
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    return await this.permissionRepository.findById(id);
  }

  async getAllPermissions(options: PaginationInput): Promise<PaginatedResponse<Permission>> {
    return await this.permissionRepository.findAll(options);
  }

  async updatePermission(id: string, permissionData: UpdatePermissionInput): Promise<Permission | null> {
    const existingPermission = await this.permissionRepository.findById(id);
    if (!existingPermission) {
      throw new Error('Permission not found');
    }

    if (permissionData.name && permissionData.name !== existingPermission.name) {
      const nameExists = await this.permissionRepository.findByName(permissionData.name);
      if (nameExists) {
        throw new Error('Permission with this name already exists');
      }
    }

    const cleanedPermissionData = Object.fromEntries(
      Object.entries(permissionData).filter(([_, value]) => value !== undefined)
    );
    const updatedPermission = await this.permissionRepository.update(id, cleanedPermissionData);
    if (updatedPermission) {
      logger.info(`Permission updated successfully: ${updatedPermission.name}`);
    }
    return updatedPermission;
  }

  async deletePermission(id: string): Promise<boolean> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new Error('Permission not found');
    }

    const deleted = await this.permissionRepository.delete(id);
    if (deleted) {
      logger.info(`Permission deleted successfully: ${permission.name}`);
    }
    return deleted;
  }

  async assignRolePermission(assignData: AssignRolePermissionInput): Promise<void> {
    const permission = await this.permissionRepository.findById(assignData.permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }

    await this.permissionRepository.assignRolePermission(assignData);
    logger.info(`Permission ${permission.name} assigned to role ${assignData.role}`);
  }

  async revokeRolePermission(role: string, permissionId: string): Promise<void> {
    const permission = await this.permissionRepository.findById(permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }

    const revoked = await this.permissionRepository.revokeRolePermission(role, permissionId);
    if (!revoked) {
      throw new Error('Role permission not found');
    }

    logger.info(`Permission ${permission.name} revoked from role ${role}`);
  }

  async getRolePermissions(role: string): Promise<Permission[]> {
    return await this.permissionRepository.findRolePermissions(role);
  }

  async assignUserPermission(assignData: AssignUserPermissionInput): Promise<void> {
    const permission = await this.permissionRepository.findById(assignData.permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }

    await this.permissionRepository.assignUserPermission(assignData);
    logger.info(`Permission ${permission.name} assigned to user ${assignData.userId}`);
  }

  async revokeUserPermission(userId: string, permissionId: string): Promise<void> {
    const permission = await this.permissionRepository.findById(permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }

    const revoked = await this.permissionRepository.revokeUserPermission(userId, permissionId);
    if (!revoked) {
      throw new Error('User permission not found');
    }

    logger.info(`Permission ${permission.name} revoked from user ${userId}`);
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    return await this.permissionRepository.findUserPermissions(userId);
  }

  async getUserAllPermissions(userId: string, userRole: string): Promise<Permission[]> {
    return await this.permissionRepository.findUserAllPermissions(userId, userRole);
  }

  async checkPermission(userId: string, userRole: string, resource: string, action: string): Promise<boolean> {
    return await this.permissionRepository.hasPermission(userId, userRole, resource, action);
  }
}