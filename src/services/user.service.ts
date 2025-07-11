import { UserRepository } from '../repositories/user.repository';
import { PermissionRepository } from '../repositories/permission.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { CreateUserInput, UpdateUserInput, LoginInput, ChangePasswordInput, PaginationInput } from '../validation/user.validation';
import { PaginatedResponse, UserWithPermissions } from '../types';
import { User } from '../db/schema';
import logger from '../utils/logger';

export class UserService {
  private userRepository: UserRepository;
  private permissionRepository: PermissionRepository;
  private refreshTokenRepository: RefreshTokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.permissionRepository = new PermissionRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  async register(userData: CreateUserInput): Promise<{ user: UserWithPermissions; token: string; refreshToken: string }> {
    const { email, username, password, ...rest } = userData;

    if (await this.userRepository.existsByEmail(email)) {
      throw new Error('Email already exists');
    }

    if (await this.userRepository.existsByUsername(username)) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await hashPassword(password);
    const cleanUserData = {
      email,
      username,
      password: hashedPassword,
      firstName: rest.firstName || null,
      lastName: rest.lastName || null,
      role: rest.role,
    };
    const user = await this.userRepository.create(cleanUserData);

    const userPermissions = await this.permissionRepository.findUserAllPermissions(user.id, user.role);
    const permissions = userPermissions.map(p => p.name);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken();
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    logger.info(`User registered successfully: ${user.email}`);

    return {
      user: {
        ...user,
        permissions,
      },
      token,
      refreshToken,
    };
  }

  async login(loginData: LoginInput): Promise<{ user: UserWithPermissions; token: string; refreshToken: string }> {
    const { email, password } = loginData;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    await this.userRepository.updateLastLogin(user.id);

    const userPermissions = await this.permissionRepository.findUserAllPermissions(user.id, user.role);
    const permissions = userPermissions.map(p => p.name);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken();
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    logger.info(`User logged in successfully: ${user.email}`);

    return {
      user: {
        ...user,
        permissions,
      },
      token,
      refreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.delete(refreshToken);
    logger.info('User logged out successfully');
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const tokenRecord = await this.refreshTokenRepository.findByToken(refreshToken);
    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.refreshTokenRepository.delete(refreshToken);
      throw new Error('Refresh token expired');
    }

    const user = await this.userRepository.findById(tokenRecord.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken();
    await this.refreshTokenRepository.delete(refreshToken);
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return { token, refreshToken: newRefreshToken };
  }

  async getUserById(id: string): Promise<UserWithPermissions | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }

    const userPermissions = await this.permissionRepository.findUserAllPermissions(user.id, user.role);
    const permissions = userPermissions.map(p => p.name);

    return {
      ...user,
      permissions,
    };
  }

  async getAllUsers(options: PaginationInput): Promise<PaginatedResponse<UserWithPermissions>> {
    const result = await this.userRepository.findAll(options);
    
    const usersWithPermissions = await Promise.all(
      result.data.map(async (user) => {
        const userPermissions = await this.permissionRepository.findUserAllPermissions(user.id, user.role);
        const permissions = userPermissions.map(p => p.name);
        return {
          ...user,
          permissions,
        };
      })
    );

    return {
      data: usersWithPermissions,
      pagination: result.pagination,
    };
  }

  async updateUser(id: string, userData: UpdateUserInput): Promise<UserWithPermissions | null> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    if (userData.email && userData.email !== existingUser.email) {
      if (await this.userRepository.existsByEmail(userData.email)) {
        throw new Error('Email already exists');
      }
    }

    if (userData.username && userData.username !== existingUser.username) {
      if (await this.userRepository.existsByUsername(userData.username)) {
        throw new Error('Username already exists');
      }
    }

    const cleanedUserData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined)
    );
    const updatedUser = await this.userRepository.update(id, cleanedUserData);
    if (!updatedUser) {
      return null;
    }

    const userPermissions = await this.permissionRepository.findUserAllPermissions(updatedUser.id, updatedUser.role);
    const permissions = userPermissions.map(p => p.name);

    logger.info(`User updated successfully: ${updatedUser.email}`);

    return {
      ...updatedUser,
      permissions,
    };
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.refreshTokenRepository.deleteByUserId(id);
    const deleted = await this.userRepository.delete(id);
    
    if (deleted) {
      logger.info(`User deleted successfully: ${user.email}`);
    }

    return deleted;
  }

  async changePassword(userId: string, passwordData: ChangePasswordInput): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isCurrentPasswordValid = await comparePassword(passwordData.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedNewPassword = await hashPassword(passwordData.newPassword);
    await this.userRepository.update(userId, { password: hashedNewPassword });

    await this.refreshTokenRepository.deleteByUserId(userId);

    logger.info(`Password changed successfully for user: ${user.email}`);
  }

  async deactivateUser(id: string): Promise<UserWithPermissions | null> {
    const user = await this.userRepository.deactivateUser(id);
    if (!user) {
      return null;
    }

    await this.refreshTokenRepository.deleteByUserId(id);

    const userPermissions = await this.permissionRepository.findUserAllPermissions(user.id, user.role);
    const permissions = userPermissions.map(p => p.name);

    logger.info(`User deactivated successfully: ${user.email}`);

    return {
      ...user,
      permissions,
    };
  }

  async activateUser(id: string): Promise<UserWithPermissions | null> {
    const user = await this.userRepository.activateUser(id);
    if (!user) {
      return null;
    }

    const userPermissions = await this.permissionRepository.findUserAllPermissions(user.id, user.role);
    const permissions = userPermissions.map(p => p.name);

    logger.info(`User activated successfully: ${user.email}`);

    return {
      ...user,
      permissions,
    };
  }
}