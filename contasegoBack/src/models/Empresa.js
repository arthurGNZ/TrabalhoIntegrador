const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Empresa = sequelize.define('Empresa', {
  cnpj: {
    type: DataTypes.STRING(14),
    primaryKey: true
  },
  razao_social: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  telefone1: DataTypes.STRING(20),
  telefone2: DataTypes.STRING(20),
  data_criacao: DataTypes.DATE
}, {
  tableName: 'empresa',
  timestamps: false
});

module.exports = Empresa;
