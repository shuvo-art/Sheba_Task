import { Model, DataTypes, Sequelize } from 'sequelize';

export class Booking extends Model {
  public id!: number;
  public customerName!: string;
  public email!: string;
  public phoneNumber!: string;
  public serviceId!: number;
  public userId!: number;
  public status!: 'pending' | 'confirmed' | 'cancelled';
  public scheduleDateTime!: Date;

  public static initModel(sequelize: Sequelize) {
    Booking.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        customerName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isEmail: true,
          },
        },
        phoneNumber: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        serviceId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
          defaultValue: 'pending',
        },
        scheduleDateTime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Booking',
        tableName: 'bookings',
        timestamps: true,
      }
    );
  }
}