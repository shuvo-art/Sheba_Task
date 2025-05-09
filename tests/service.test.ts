import supertest from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/config/database';
import { Service } from '../src/modules/service/service.model';
import { User } from '../src/modules/user/user.model';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Service API', () => {
  let adminToken: string;
  let userToken: string;
  let admin: any;

  beforeEach(async () => {
    admin = await User.create({
      email: 'admin@example.com',
      password: await bcrypt.hash('password', 10),
      role: 'admin',
    });

    const user = await User.create({
      email: 'user@example.com',
      password: await bcrypt.hash('password', 10),
      role: 'user',
    });

    adminToken = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET);
    userToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
  });

  describe('GET /api/services', () => {
    it('should list services with pagination', async () => {
      await Service.create({
        name: 'Test Service',
        category: 'Test',
        price: 100,
        description: 'Test description',
      });

      const response = await supertest(app)
        .get('/api/services?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.services).toHaveLength(1);
      expect(response.body.data.services[0].name).toBe('Test Service');
      expect(response.body.data.total).toBe(1);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(10);
    });

    it('should return empty list when no services exist', async () => {
      const response = await supertest(app)
        .get('/api/services?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.services).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await supertest(app)
        .get('/api/services?page=-1&limit=0')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.services).toHaveLength(0);
    });
  });

  describe('POST /api/services', () => {
    it('should create a service with admin token', async () => {
      const response = await supertest(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Service',
          category: 'New',
          price: 200,
          description: 'New description',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Service');
      expect(response.body.data.price).toBe(200);
    });

    it('should fail to create a service without token', async () => {
      const response = await supertest(app)
        .post('/api/services')
        .send({
          name: 'New Service',
          category: 'New',
          price: 200,
          description: 'New description',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should fail to create a service with user token', async () => {
      const response = await supertest(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'New Service',
          category: 'New',
          price: 200,
          description: 'New description',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Forbidden');
    });

    it('should fail to create a service with invalid input', async () => {
      const response = await supertest(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '',
          category: '',
          price: -200,
          description: '',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });
  });

  describe('PUT /api/services/:id', () => {
    it('should update a service with admin token', async () => {
      const service = await Service.create({
        name: 'Old Service',
        category: 'Old',
        price: 100,
        description: 'Old description',
      });

      const response = await supertest(app)
        .put(`/api/services/${service.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Service',
          category: 'Updated',
          price: 150,
          description: 'Updated description',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Service');
      expect(response.body.data.price).toBe(150);
    });

    it('should fail to update a service without token', async () => {
      const service = await Service.create({
        name: 'Old Service',
        category: 'Old',
        price: 100,
        description: 'Old description',
      });

      const response = await supertest(app)
        .put(`/api/services/${service.id}`)
        .send({
          name: 'Updated Service',
          category: 'Updated',
          price: 150,
          description: 'Updated description',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should fail to update a service with user token', async () => {
      const service = await Service.create({
        name: 'Old Service',
        category: 'Old',
        price: 100,
        description: 'Old description',
      });

      const response = await supertest(app)
        .put(`/api/services/${service.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Service',
          category: 'Updated',
          price: 150,
          description: 'Updated description',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Forbidden');
    });

    it('should fail to update a non-existent service', async () => {
      const response = await supertest(app)
        .put('/api/services/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Service',
          category: 'Updated',
          price: 150,
          description: 'Updated description',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Service not found');
    });
  });

  describe('DELETE /api/services/:id', () => {
    it('should delete a service with admin token', async () => {
      const service = await Service.create({
        name: 'Test Service',
        category: 'Test',
        price: 100,
        description: 'Test description',
      });

      const response = await supertest(app)
        .delete(`/api/services/${service.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Service deleted');

      const deletedService = await Service.findByPk(service.id);
      expect(deletedService).toBeNull();
    });

    it('should fail to delete a service without token', async () => {
      const service = await Service.create({
        name: 'Test Service',
        category: 'Test',
        price: 100,
        description: 'Test description',
      });

      const response = await supertest(app)
        .delete(`/api/services/${service.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should fail to delete a service with user token', async () => {
      const service = await Service.create({
        name: 'Test Service',
        category: 'Test',
        price: 100,
        description: 'Test description',
      });

      const response = await supertest(app)
        .delete(`/api/services/${service.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Forbidden');
    });

    it('should fail to delete a non-existent service', async () => {
      const response = await supertest(app)
        .delete('/api/services/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Service not found');
    });
  });
});