import { Model, DataTypes, Sequelize } from 'sequelize';

export class Service extends Model {
  public id!: number;
  public name!: string;
  public category!: string;
  public price!: number;
  public description!: string;

  public static initModel(sequelize: Sequelize) {
    Service.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        category: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        price: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Service',
        tableName: 'services',
        timestamps: true,
      }
    );
  }
}