const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { testConnection } = require('./config/database');

const authRoutes = require('./routes/auth.routes.js');
const personRoutes = require('./routes/person.routes.js');
const rolesRoutes = require('./routes/role.routes.js');
const businessRoutes = require('./routes/business.routes.js');
const dashboardRoutes = require('./routes/dashboard.routes..js');
const otherRoutes = require('./routes/outher.routes.js');

const app = express();

app.use(cors());
app.use(express.json());

testConnection();

app.use('/auth', authRoutes);
app.use('/person', personRoutes);
app.use('/role', rolesRoutes);
app.use('/business', businessRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/other', otherRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

module.exports = app;