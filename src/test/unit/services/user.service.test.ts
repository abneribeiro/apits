import { UserService } from '../../../services/user.service';
import { UserRepository } from '../../../repositories/user.repository';
import { PermissionRepository } from '../../../repositories/permission.repository';
import { RefreshTokenRepository } from '../../../repositories/refresh-token.repository';
import { createTestUser } from '../../helpers/test-utils';
import { hashPassword } from '../../../utils/bcrypt';

jest.mock('../../../repositories/user.repository');
jest.mock('../../../repositories/permission.repository');
jest.mock('../../../repositories/refresh-token.repository');
jest.mock('../../../utils/bcrypt');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPermissionRepository: jest.Mocked<PermissionRepository>;
  let mockRefreshTokenRepository: jest.Mocked<RefreshTokenRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockPermissionRepository = new PermissionRepository() as jest.Mocked<PermissionRepository>;
    mockRefreshTokenRepository = new RefreshTokenRepository() as jest.Mocked<RefreshTokenRepository>;
    
    userService = new UserService();
    (userService as any).userRepository = mockUserRepository;
    (userService as any).permissionRepository = mockPermissionRepository;
    (userService as any).refreshTokenRepository = mockRefreshTokenRepository;
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'user' as const,
      };

      const testUser = createTestUser();
      const hashedPassword = 'hashedpassword';

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.existsByUsername.mockResolvedValue(false);
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(testUser);
      mockPermissionRepository.findUserAllPermissions.mockResolvedValue([]);
      mockRefreshTokenRepository.create.mockResolvedValue({
        id: '123',
        userId: testUser.id,
        token: 'refresh-token',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const result = await userService.register(userData);

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.existsByUsername).toHaveBeenCalledWith(userData.username);
      expect(hashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      });
      expect(result.user).toEqual(expect.objectContaining({
        id: testUser.id,
        email: testUser.email,
        username: testUser.username,
      }));
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        role: 'user' as const,
      };

      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(userService.register(userData)).rejects.toThrow('Email already exists');
    });

    it('should throw error if username already exists', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        role: 'user' as const,
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.existsByUsername.mockResolvedValue(true);

      await expect(userService.register(userData)).rejects.toThrow('Username already exists');
    });
  });

  describe('getUserById', () => {
    it('should return user with permissions', async () => {
      const testUser = createTestUser();
      const permissions = [
        { id: '1', name: 'read_users', description: 'Read users', resource: 'users', action: 'read', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockUserRepository.findById.mockResolvedValue(testUser);
      mockPermissionRepository.findUserAllPermissions.mockResolvedValue(permissions);

      const result = await userService.getUserById(testUser.id);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(testUser.id);
      expect(mockPermissionRepository.findUserAllPermissions).toHaveBeenCalledWith(testUser.id, testUser.role);
      expect(result).toEqual(expect.objectContaining({
        id: testUser.id,
        email: testUser.email,
        permissions: ['read_users'],
      }));
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await userService.getUserById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = { firstName: 'Updated', lastName: 'Name' };
      const existingUser = createTestUser();
      const updatedUser = createTestUser({ ...existingUser, ...updateData });

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);
      mockPermissionRepository.findUserAllPermissions.mockResolvedValue([]);

      const result = await userService.updateUser(userId, updateData);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(expect.objectContaining({
        firstName: 'Updated',
        lastName: 'Name',
      }));
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.updateUser('nonexistent-id', {})).rejects.toThrow('User not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const testUser = createTestUser();

      mockUserRepository.findById.mockResolvedValue(testUser);
      mockRefreshTokenRepository.deleteByUserId.mockResolvedValue(true);
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await userService.deleteUser(userId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockRefreshTokenRepository.deleteByUserId).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser('nonexistent-id')).rejects.toThrow('User not found');
    });
  });
});