const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permissao = sequelize.define('Permissao', {
  sigla_permissao: {
    type: DataTypes.STRING(20),
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descricao: DataTypes.TEXT
}, {
  tableName: 'permissao',
  timestamps: false
});

module.exports = Permissao;

