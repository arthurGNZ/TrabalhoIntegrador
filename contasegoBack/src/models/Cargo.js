const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cargo = sequelize.define('Cargo', {
  sigla_cargo: {
    type: DataTypes.STRING(20),
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'cargo',
  timestamps: false
});

module.exports = Cargo;
