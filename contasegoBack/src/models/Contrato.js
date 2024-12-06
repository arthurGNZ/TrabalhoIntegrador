const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contrato = sequelize.define('Contrato', {
  cpf_pessoa: {
    type: DataTypes.STRING(11),
    primaryKey: true,
    references: {
      model: 'pessoa',
      key: 'cpf'
    }
  },
  cnpj_empresa: {
    type: DataTypes.STRING(14),
    primaryKey: true,
    references: {
      model: 'empresa',
      key: 'cnpj'
    }
  },
  sigla_cargo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    references: {
      model: 'cargo',
      key: 'sigla_cargo'
    }
  },
  data_contrato: DataTypes.DATE
}, {
  tableName: 'contrato',
  timestamps: false
});

module.exports = Contrato;
