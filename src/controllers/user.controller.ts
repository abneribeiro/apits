import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { CreateUserInput, UpdateUserInput, LoginInput, ChangePasswordInput, PaginationInput } from '../validation/user.validation';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserInput = req.body;
      const result = await this.userService.register(userData);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Registration failed', 400);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginData: LoginInput = req.body;
      const result = await this.userService.login(loginData);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Login failed', 401);
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      await this.userService.logout(refreshToken);
      sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Logout failed', 400);
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const result = await this.userService.refreshToken(refreshToken);
      sendSuccess(res, result, 'Token refreshed successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Token refresh failed', 401);
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const user = await this.userService.getUserById(req.user.userId);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to get profile', 500);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const userData: UpdateUserInput = req.body;
      const user = await this.userService.updateUser(req.user.userId, userData);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to update profile', 400);
    }
  };

  changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const passwordData: ChangePasswordInput = req.body;
      await this.userService.changePassword(req.user.userId, passwordData);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to change password', 400);
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const options: PaginationInput = req.query as any;
      const users = await this.userService.getAllUsers(options);
      sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to get users', 500);
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        sendError(res, 'User ID is required', 400);
        return;
      }
      const user = await this.userService.getUserById(id);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to get user', 500);
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        sendError(res, 'User ID is required', 400);
        return;
      }
      const userData: UpdateUserInput = req.body;
      const user = await this.userService.updateUser(id, userData);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to update user', 400);
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        sendError(res, 'User ID is required', 400);
        return;
      }
      const deleted = await this.userService.deleteUser(id);
      if (!deleted) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to delete user', 500);
    }
  };

  deactivateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        sendError(res, 'User ID is required', 400);
        return;
      }
      const user = await this.userService.deactivateUser(id);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, user, 'User deactivated successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to deactivate user', 500);
    }
  };

  activateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        sendError(res, 'User ID is required', 400);
        return;
      }
      const user = await this.userService.activateUser(id);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, user, 'User activated successfully');
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Failed to activate user', 500);
    }
  };
}