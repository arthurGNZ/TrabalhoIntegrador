const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pessoa = sequelize.define('Pessoa', {
 cpf: {
   type: DataTypes.STRING(11),
   primaryKey: true
 },
 nome: {
   type: DataTypes.STRING(100),
   allowNull: false
 },
 email: {
   type: DataTypes.STRING(100),
   allowNull: false,
   unique: true
 },
 senha: {
   type: DataTypes.STRING(255),
   allowNull: false
 },
 alterar_senha: {
   type: DataTypes.BOOLEAN,
   defaultValue: false
 },
 data_nascimento: DataTypes.DATE,
 telefone_principal: DataTypes.STRING(20),
 telefone_secundario: DataTypes.STRING(20), 
 data_ultimo_login: DataTypes.DATE,
 ultima_empresa_acessada: {
   type: DataTypes.STRING(14),
   references: {
     model: 'empresa',
     key: 'cnpj'
   }
 }
}, {
 tableName: 'pessoa',
 timestamps: false
});

module.exports = Pessoa;