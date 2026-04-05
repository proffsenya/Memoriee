const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Event = require('./Event');

const Photo = sequelize.define('Photo', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  url: { type: DataTypes.STRING, allowNull: false },
  eventId: { type: DataTypes.UUID, references: { model: Event, key: 'id' } },
  guestId: { type: DataTypes.STRING, allowNull: false },
  guestName: { type: DataTypes.STRING, allowNull: true }, // <-- новое поле
}, { timestamps: true });

Event.hasMany(Photo, { foreignKey: 'eventId' });
Photo.belongsTo(Event, { foreignKey: 'eventId' });

module.exports = Photo;