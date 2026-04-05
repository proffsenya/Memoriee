const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GuestUsage = sequelize.define('GuestUsage', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  eventId: { type: DataTypes.UUID, allowNull: false },
  guestId: { type: DataTypes.STRING, allowNull: false },
  count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { timestamps: true });

module.exports = GuestUsage;