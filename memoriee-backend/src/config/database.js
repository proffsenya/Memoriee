const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',  // файл БД в корне проекта
  logging: false,
});

module.exports = sequelize;