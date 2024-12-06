const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CargoPermissao = sequelize.define('CargoPermissao', {
  sigla_cargo: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    references: {
      model: 'cargo',
      key: 'sigla_cargo'
    }
  },
  sigla_permissao: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    references: {
      model: 'permissao',
      key: 'sigla_permissao'
    }
  }
}, {
  tableName: 'cargo_permissao',
  timestamps: false
});

module.exports = CargoPermissao;
