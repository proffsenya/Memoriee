const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Filter = sequelize.define('Filter', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  type: { type: DataTypes.ENUM('preset', 'custom'), defaultValue: 'custom' },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: false },
  userId: { 
    type: DataTypes.UUID, 
    references: { model: User, key: 'id' },
    allowNull: true
  },
  params: {
    type: DataTypes.JSON,
    defaultValue: {
      filterType: 'warm',
      brightness: 1.0,
      contrast: 1.0,
      saturation: 1.0,
      hue: 0,
      warmth: 0,
      tint: 0,
      fade: 0,
      vignette: 0
    }
  }
}, { timestamps: true });

User.hasMany(Filter, { foreignKey: 'userId' });
Filter.belongsTo(User, { foreignKey: 'userId' });

module.exports = Filter;
