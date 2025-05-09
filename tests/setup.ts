// tests/setup.ts
import { sequelize } from '../src/config/database';
import { initDatabase } from '../src/config/database';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret'; // Set JWT_SECRET for consistency

beforeAll(async () => {
  await initDatabase(); // Ensure database is initialized before tests
});

afterAll(async () => {
  await sequelize.close(); // Clean up the database connection
});