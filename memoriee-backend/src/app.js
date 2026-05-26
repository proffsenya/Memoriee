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


// HTTPS redirect for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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