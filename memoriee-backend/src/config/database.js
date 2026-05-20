const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',  // файл БД в корне проекта
  logging: false,
  dialectOptions: {
    // Disable foreign key constraints for SQLite during schema changes
    // This allows Sequelize to properly alter tables without constraint violations
    busyTimeout: 30000,
  },
});

module.exports = sequelize;