const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Event = sequelize.define('Event', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  filter: { type: DataTypes.ENUM('warm', 'bw', 'vintage'), defaultValue: 'warm' },
  photosPerGuest: { type: DataTypes.INTEGER, defaultValue: 30 },
  userId: { type: DataTypes.UUID, references: { model: User, key: 'id' } },
}, { timestamps: true });

User.hasMany(Event, { foreignKey: 'userId' });
Event.belongsTo(User, { foreignKey: 'userId' });

module.exports = Event;