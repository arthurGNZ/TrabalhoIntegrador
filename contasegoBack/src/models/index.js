const Pessoa = require('./Pessoa');
const Empresa = require('./empresa');
const Permissao = require('./Permissao');
const Cargo = require('./Cargo');
const CargoPermissao = require('./CargoPermissao');
const Contrato = require('./Contrato');

Pessoa.belongsTo(Empresa, { foreignKey: 'ultima_empresa_acessada' });
Empresa.hasMany(Pessoa, { foreignKey: 'ultima_empresa_acessada' });

Cargo.belongsToMany(Permissao, { 
  through: CargoPermissao,
  foreignKey: 'sigla_cargo',
  otherKey: 'sigla_permissao'
});
Permissao.belongsToMany(Cargo, { 
  through: CargoPermissao,
  foreignKey: 'sigla_permissao',
  otherKey: 'sigla_cargo'
});

Pessoa.belongsToMany(Empresa, { 
  through: Contrato,
  foreignKey: 'cpf_pessoa',
  otherKey: 'cnpj_empresa'
});
Empresa.belongsToMany(Pessoa, { 
  through: Contrato,
  foreignKey: 'cnpj_empresa',
  otherKey: 'cpf_pessoa'
});

Contrato.belongsTo(Cargo, { foreignKey: 'sigla_cargo' });
Cargo.hasMany(Contrato, { foreignKey: 'sigla_cargo' });

Contrato.belongsTo(Empresa, { 
  foreignKey: 'cnpj_empresa', 
  targetKey: 'cnpj'
});
Empresa.hasMany(Contrato, { 
  foreignKey: 'cnpj_empresa', 
  sourceKey: 'cnpj'
});

Contrato.belongsTo(Pessoa, { 
  foreignKey: 'cpf_pessoa', 
  targetKey: 'cpf'
});
Pessoa.hasMany(Contrato, { 
  foreignKey: 'cpf_pessoa', 
  sourceKey: 'cpf'
});

CargoPermissao.belongsTo(Permissao, {
  foreignKey: 'sigla_permissao',
  targetKey: 'sigla_permissao'
});

module.exports = {
  Pessoa,
  Empresa,
  Permissao,
  Cargo,
  CargoPermissao,
  Contrato
};