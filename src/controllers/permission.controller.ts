import { Request, Response } from 'express';
import { PermissionService } from '../services/permission.service';
import { sendSuccess, sendError } from '../utils/response';
import { CreatePermissionInput, UpdatePermissionInput, AssignRolePermissionInput, AssignUserPermissionInput, PaginationInput } from '../validation/permission.validation';

export class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  createPermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const permissionData: CreatePermissionInput = req.body;
      const permission = await this.permissionService.createPermission(permissionData);
      sendSuccess(res, permission, 'Permission created successfully', 201);
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to create permission', 400);
    }
  };

  getAllPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const options: PaginationInput = req.query as any;
      const permissions = await this.permissionService.getAllPermissions(options);
      sendSuccess(res, permissions, 'Permissions retrieved successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to get permissions', 500);
    }
  };

  getPermissionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        sendError(res, 'Permission ID is required', 400);
        return;
      }
      const permission = await this.permissionService.getPermissionById(id);
      if (!permission) {
        sendError(res, 'Permission not found', 404);
        return;
      }

      sendSuccess(res, permission, 'Permission retrieved successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to get permission', 500);
    }
  };

  updatePermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        sendError(res, 'Permission ID is required', 400);
        return;
      }
      const permissionData: UpdatePermissionInput = req.body;
      const permission = await this.permissionService.updatePermission(id, permissionData);
      if (!permission) {
        sendError(res, 'Permission not found', 404);
        return;
      }

      sendSuccess(res, permission, 'Permission updated successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to update permission', 400);
    }
  };

  deletePermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        sendError(res, 'Permission ID is required', 400);
        return;
      }
      const deleted = await this.permissionService.deletePermission(id);
      if (!deleted) {
        sendError(res, 'Permission not found', 404);
        return;
      }

      sendSuccess(res, null, 'Permission deleted successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to delete permission', 500);
    }
  };

  assignRolePermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const assignData: AssignRolePermissionInput = req.body;
      await this.permissionService.assignRolePermission(assignData);
      sendSuccess(res, null, 'Permission assigned to role successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to assign permission to role', 400);
    }
  };

  revokeRolePermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const { role, permissionId } = req.body;
      await this.permissionService.revokeRolePermission(role, permissionId);
      sendSuccess(res, null, 'Permission revoked from role successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to revoke permission from role', 400);
    }
  };

  getRolePermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { role } = req.params;
      if (!role) {
        sendError(res, 'Role is required', 400);
        return;
      }
      const permissions = await this.permissionService.getRolePermissions(role);
      sendSuccess(res, permissions, 'Role permissions retrieved successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to get role permissions', 500);
    }
  };

  assignUserPermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const assignData: AssignUserPermissionInput = req.body;
      await this.permissionService.assignUserPermission(assignData);
      sendSuccess(res, null, 'Permission assigned to user successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to assign permission to user', 400);
    }
  };

  revokeUserPermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, permissionId } = req.body;
      await this.permissionService.revokeUserPermission(userId, permissionId);
      sendSuccess(res, null, 'Permission revoked from user successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to revoke permission from user', 400);
    }
  };

  getUserPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!userId) {
        sendError(res, 'User ID is required', 400);
        return;
      }
      const permissions = await this.permissionService.getUserPermissions(userId);
      sendSuccess(res, permissions, 'User permissions retrieved successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to get user permissions', 500);
    }
  };

  getUserAllPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!userId) {
        sendError(res, 'User ID is required', 400);
        return;
      }
      const { role } = req.query as { role: string };
      if (!role) {
        sendError(res, 'Role is required', 400);
        return;
      }
      const permissions = await this.permissionService.getUserAllPermissions(userId, role);
      sendSuccess(res, permissions, 'User all permissions retrieved successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to get user all permissions', 500);
    }
  };
}