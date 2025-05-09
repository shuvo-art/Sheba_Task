import { Sequelize } from 'sequelize';
import { Service } from '../modules/service/service.model';
import { Booking } from '../modules/booking/booking.model';
import { User } from '../modules/user/user.model';

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/sheba', {
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
    Service.initModel(sequelize);
    Booking.initModel(sequelize);
    User.initModel(sequelize);
    Service.hasMany(Booking, { foreignKey: 'serviceId' });
    Booking.belongsTo(Service, { foreignKey: 'serviceId' });
    User.hasMany(Booking, { foreignKey: 'userId' });
    Booking.belongsTo(User, { foreignKey: 'userId' });
    await sequelize.sync({ force: process.env.NODE_ENV === 'test' });
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export { sequelize };