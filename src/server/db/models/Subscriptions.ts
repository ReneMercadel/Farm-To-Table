import { DataTypes } from 'sequelize';
import { db } from '../database';
import Farms from './Farms';
// import Users from './Users';

const Subscriptions = db.define('subscriptions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    allowNull: false,
    autoIncrement: true,
  },
  season: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  flat_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  weekly_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(10000),
    allowNull: false,
  },
  start_date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  farm_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Farms, key: 'id' },
  },
});

export default Subscriptions;
