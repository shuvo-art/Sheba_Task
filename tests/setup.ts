// tests/setup.ts
import { sequelize } from '../src/config/database';
import { initDatabase } from '../src/config/database';

process.env.NODE_ENV = 'test';
beforeAll(async () => {
  await initDatabase(); // Ensure database is initialized before tests
});

afterAll(async () => {
  await sequelize.close(); // Clean up the database connection
});