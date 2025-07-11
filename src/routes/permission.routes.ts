import { Router } from 'express';
import { PermissionController } from '../controllers/permission.controller';
import { authenticateToken, requireRole, requirePermission } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import { createPermissionSchema, updatePermissionSchema, assignRolePermissionSchema, assignUserPermissionSchema, paginationSchema } from '../validation/permission.validation';

const router = Router();
const permissionController = new PermissionController();

router.post('/', 
  authenticateToken, 
  requireRole(['admin']), 
  validateBody(createPermissionSchema), 
  permissionController.createPermission
);

router.get('/', 
  authenticateToken, 
  requireRole(['admin']), 
  validateQuery(paginationSchema), 
  permissionController.getAllPermissions
);

router.get('/:id', 
  authenticateToken, 
  requireRole(['admin']), 
  permissionController.getPermissionById
);

router.put('/:id', 
  authenticateToken, 
  requireRole(['admin']), 
  validateBody(updatePermissionSchema), 
  permissionController.updatePermission
);

router.delete('/:id', 
  authenticateToken, 
  requireRole(['admin']), 
  permissionController.deletePermission
);

router.post('/role/assign', 
  authenticateToken, 
  requireRole(['admin']), 
  validateBody(assignRolePermissionSchema), 
  permissionController.assignRolePermission
);

router.post('/role/revoke', 
  authenticateToken, 
  requireRole(['admin']), 
  permissionController.revokeRolePermission
);

router.get('/role/:role', 
  authenticateToken, 
  requireRole(['admin']), 
  permissionController.getRolePermissions
);

router.post('/user/assign', 
  authenticateToken, 
  requireRole(['admin']), 
  validateBody(assignUserPermissionSchema), 
  permissionController.assignUserPermission
);

router.post('/user/revoke', 
  authenticateToken, 
  requireRole(['admin']), 
  permissionController.revokeUserPermission
);

router.get('/user/:userId', 
  authenticateToken, 
  requireRole(['admin']), 
  permissionController.getUserPermissions
);

router.get('/user/:userId/all', 
  authenticateToken, 
  requireRole(['admin']), 
  permissionController.getUserAllPermissions
);

export default router;