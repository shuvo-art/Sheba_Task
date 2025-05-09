import supertest from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/config/database';
import { Booking } from '../src/modules/booking/booking.model';
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

describe('Booking API', () => {
  let adminToken: string;
  let userToken: string;
  let admin: any;
  let user: any;
  let service: any;

  beforeEach(async () => {
    admin = await User.create({
      email: 'admin@example.com',
      password: await bcrypt.hash('password', 10),
      role: 'admin',
    });

    user = await User.create({
      email: 'user@example.com',
      password: await bcrypt.hash('password', 10),
      role: 'user',
    });

    adminToken = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET);
    userToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);

    service = await Service.create({
      name: 'Test Service',
      category: 'Test',
      price: 100,
      description: 'Test description',
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a booking with user token', async () => {
      const response = await supertest(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          customerName: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '1234567890',
          serviceId: service.id,
          scheduleDateTime: '2025-05-10T10:00:00Z',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customerName).toBe('John Doe');
      expect(response.body.data.email).toBe('john.doe@example.com');
      expect(response.body.data.serviceId).toBe(service.id);
      expect(response.body.data.userId).toBe(user.id);
    });

    it('should fail to create a booking without token', async () => {
      const response = await supertest(app)
        .post('/api/bookings')
        .send({
          customerName: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '1234567890',
          serviceId: service.id,
          scheduleDateTime: '2025-05-10T10:00:00Z',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should fail to create a booking with invalid input', async () => {
      const response = await supertest(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          customerName: '',
          email: 'invalid',
          phoneNumber: '123',
          serviceId: -1,
          scheduleDateTime: 'invalid-date',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should fail to create a booking with non-existent service', async () => {
      const response = await supertest(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          customerName: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '1234567890',
          serviceId: 999,
          scheduleDateTime: '2025-05-10T10:00:00Z',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Service not found');
    });

    it('should fail to create a booking with past schedule date', async () => {
      const response = await supertest(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          customerName: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '1234567890',
          serviceId: service.id,
  scheduleDateTime: '2020-01-01T10:00:00Z',
})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to create booking: Schedule date/time must be in the future');
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should get booking status with user token', async () => {
      const booking = await Booking.create({
        customerName: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '1234567890',
        serviceId: service.id,
        userId: user.id,
        scheduleDateTime: new Date('2025-05-10T10:00:00Z'),
        status: 'pending',
      });

      const response = await supertest(app)
        .get(`/api/bookings/${booking.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(booking.id);
      expect(response.body.data.customerName).toBe('John Doe');
      expect(response.body.data.email).toBe('john.doe@example.com');
    });

    it('should fail to get booking status without token', async () => {
      const booking = await Booking.create({
        customerName: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '1234567890',
        serviceId: service.id,
        userId: user.id,
        scheduleDateTime: new Date('2025-05-10T10:00:00Z'),
        status: 'pending',
      });

      const response = await supertest(app)
        .get(`/api/bookings/${booking.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should fail to get non-existent booking', async () => {
      const response = await supertest(app)
        .get('/api/bookings/999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Booking not found or unauthorized');
    });

    it('should fail to get booking for another user', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        password: await bcrypt.hash('password', 10),
        role: 'user',
      });

      const booking = await Booking.create({
        customerName: 'Jane Doe',
        email: 'jane.doe@example.com',
        phoneNumber: '0987654321',
        serviceId: service.id,
        userId: otherUser.id,
        scheduleDateTime: new Date('2025-05-10T10:00:00Z'),
        status: 'pending',
      });

      const response = await supertest(app)
        .get(`/api/bookings/${booking.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Booking not found or unauthorized');
    });
  });

  describe('GET /api/bookings', () => {
    it('should list all bookings with admin token', async () => {
      await Booking.create({
        customerName: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '1234567890',
        serviceId: service.id,
        userId: user.id,
        scheduleDateTime: new Date('2025-05-10T10:00:00Z'),
        status: 'pending',
      });

      const response = await supertest(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].customerName).toBe('John Doe');
      expect(response.body.data[0].email).toBe('john.doe@example.com');
    });

    it('should fail to list bookings with user token', async () => {
      const response = await supertest(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Forbidden');
    });

    it('should fail to list bookings without token', async () => {
      const response = await supertest(app)
        .get('/api/bookings')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unauthorized');
    });
  });
});