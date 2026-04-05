const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const photoRoutes = require('./routes/photoRoutes');
const guestRoutes = require('./routes/guestRoutes');

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

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
}).catch(err => console.error('DB error:', err));

module.exports = app;