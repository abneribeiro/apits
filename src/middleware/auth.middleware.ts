import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserService } from '../services/user.service';
import { PermissionService } from '../services/permission.service';
import { sendError } from '../utils/response';
import { JwtPayload } from '../types';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      sendError(res, 'Access token is required', 401);
      return;
    }

    const decoded = verifyToken(token);
    const userService = new UserService();
    const user = await userService.getUserById(decoded.userId);

    if (!user || !user.isActive) {
      sendError(res, 'User not found or inactive', 401);
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    sendError(res, 'Invalid or expired token', 401);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
};

export const requirePermission = (resource: string, action: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }

      const permissionService = new PermissionService();
      const hasPermission = await permissionService.checkPermission(
        req.user.userId,
        req.user.role,
        resource,
        action
      );

      if (!hasPermission) {
        sendError(res, 'Insufficient permissions', 403);
        return;
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      sendError(res, 'Error checking permissions', 500);
    }
  };
};

export const requireSelfOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    sendError(res, 'Authentication required', 401);
    return;
  }

  const targetUserId = req.params.id;
  const isAdmin = req.user.role === 'admin';
  const isSelf = req.user.userId === targetUserId;

  if (!isAdmin && !isSelf) {
    sendError(res, 'You can only access your own resources', 403);
    return;
  }

  next();
};