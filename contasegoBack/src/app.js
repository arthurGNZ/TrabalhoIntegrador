const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { testConnection } = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const personRoutes = require('./routes/personRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const businessRoutes = require('./routes/businessRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Test Database Connection
testConnection();

app.use('/auth', authRoutes);
app.use('/person', personRoutes);
app.use('/roles', rolesRoutes);
app.use('/business', businessRoutes);
app.use('/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

module.exports = app;