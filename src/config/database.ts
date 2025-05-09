import { Sequelize } from 'sequelize';
import { Service } from '../modules/service/service.model';
import { Booking } from '../modules/booking/booking.model';
import { User } from '../modules/user/user.model';

const isTestEnv = process.env.NODE_ENV === 'test';

// Use SQLite for tests, otherwise use the DATABASE_URL
const sequelize = isTestEnv
  ? new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:', // Explicitly use in-memory storage for SQLite
      logging: false,
    })
  : new Sequelize(process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/sheba', {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Allow self-signed certificates
        },
      },
      logging: false,
    });

export async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Initialize models
    User.initModel(sequelize);
    Service.initModel(sequelize);
    Booking.initModel(sequelize);

    // Define associations
    User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
    Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Service.hasMany(Booking, { foreignKey: 'serviceId', as: 'bookings' });
    Booking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

    // Disable foreign key checks for SQLite during sync (test environment)
    if (isTestEnv) {
      await sequelize.query('PRAGMA foreign_keys = OFF;');
    }

    // Sync database with proper table creation order
    await sequelize.sync({ force: process.env.NODE_ENV === 'test' });
    console.log('Database models synchronized');

    // Re-enable foreign key checks after sync
    if (isTestEnv) {
      await sequelize.query('PRAGMA foreign_keys = ON;');
    }
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export { sequelize };