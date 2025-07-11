import request from 'supertest';
import app from '../../app';
import { createAdminToken, createTestToken } from '../helpers/test-utils';

describe('Permission Routes', () => {
  const adminToken = createAdminToken();
  const userToken = createTestToken();

  describe('POST /api/v1/permissions', () => {
    it('should create a new permission for admin', async () => {
      const permissionData = {
        name: 'read_reports',
        description: 'Permission to read reports',
        resource: 'reports',
        action: 'read',
      };

      const response = await request(app)
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(permissionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Permission created successfully');
      expect(response.body.data.name).toBe(permissionData.name);
      expect(response.body.data.resource).toBe(permissionData.resource);
      expect(response.body.data.action).toBe(permissionData.action);
    });

    it('should deny access for non-admin users', async () => {
      const permissionData = {
        name: 'read_reports',
        description: 'Permission to read reports',
        resource: 'reports',
        action: 'read',
      };

      const response = await request(app)
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(permissionData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient permissions');
    });

    it('should return validation error for missing required fields', async () => {
      const permissionData = {
        name: 'read_reports',
      };

      const response = await request(app)
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(permissionData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation error');
    });
  });

  describe('GET /api/v1/permissions', () => {
    it('should get all permissions for admin', async () => {
      const response = await request(app)
        .get('/api/v1/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: '1', limit: '10' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should deny access for non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/permissions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient permissions');
    });
  });

  describe('GET /api/v1/permissions/:id', () => {
    it('should get permission by id for admin', async () => {
      const permissionId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .get(`/api/v1/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(permissionId);
    });

    it('should return 404 for non-existent permission', async () => {
      const permissionId = '123e4567-e89b-12d3-a456-426614174999';

      const response = await request(app)
        .get(`/api/v1/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Permission not found');
    });
  });

  describe('PUT /api/v1/permissions/:id', () => {
    it('should update permission for admin', async () => {
      const permissionId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = {
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/v1/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Permission updated successfully');
      expect(response.body.data.description).toBe(updateData.description);
    });
  });

  describe('DELETE /api/v1/permissions/:id', () => {
    it('should delete permission for admin', async () => {
      const permissionId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .delete(`/api/v1/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Permission deleted successfully');
    });
  });

  describe('POST /api/v1/permissions/role/assign', () => {
    it('should assign permission to role for admin', async () => {
      const assignData = {
        role: 'user',
        permissionId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const response = await request(app)
        .post('/api/v1/permissions/role/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Permission assigned to role successfully');
    });
  });

  describe('GET /api/v1/permissions/role/:role', () => {
    it('should get role permissions for admin', async () => {
      const role = 'user';

      const response = await request(app)
        .get(`/api/v1/permissions/role/${role}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /api/v1/permissions/user/assign', () => {
    it('should assign permission to user for admin', async () => {
      const assignData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        permissionId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const response = await request(app)
        .post('/api/v1/permissions/user/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Permission assigned to user successfully');
    });
  });

  describe('GET /api/v1/permissions/user/:userId', () => {
    it('should get user permissions for admin', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .get(`/api/v1/permissions/user/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
});