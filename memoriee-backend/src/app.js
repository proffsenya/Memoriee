const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const photoRoutes = require('./routes/photoRoutes');
const guestRoutes = require('./routes/guestRoutes');
const filterRoutes = require('./routes/filterRoutes');

const app = express();

// Полностью открытый CORS (только для разработки!)
app.use(cors({
  origin: true,        // разрешить любой источник
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/filters', filterRoutes);

// Database sync with foreign key constraint handling for SQLite
const syncDatabase = async () => {
  try {
    // Disable foreign keys before sync
    await sequelize.query('PRAGMA foreign_keys = OFF');
    
    // Sync database schema
    await sequelize.sync({ alter: true });
    
    // Re-enable foreign keys
    await sequelize.query('PRAGMA foreign_keys = ON');
    
    console.log('Database synced successfully');
  } catch (err) {
    console.error('DB error:', err);
  }
};

syncDatabase();

module.exports = app;