const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Cargo, CargoPermissao, Permissao, Contrato } = require('../models');

class RoleService {
  async create(data) {
    const { sigla_cargo, nome, permissoes } = data;

    const cargoExiste = await Cargo.findByPk(sigla_cargo);
    if (cargoExiste) {
      throw new Error('Cargo com esta sigla já existe');
    }

    const nomeExiste = await Cargo.findOne({ where: { nome } });
    if (nomeExiste) {
      throw new Error('Já existe um cargo com este nome');
    }

    const transaction = await sequelize.transaction();

    try {
      const novoCargo = await Cargo.create({
        sigla_cargo,
        nome
      }, { transaction });

      if (permissoes && permissoes.length > 0) {
        const permissoesParaAssociar = [];
        
        for (const perm of permissoes) {
          let permissao;
          if (perm.sigla_permissao) {
            permissao = await Permissao.findByPk(perm.sigla_permissao);
            if (!permissao) {
              throw new Error(`Permissão com sigla ${perm.sigla_permissao} não encontrada`);
            }
            permissoesParaAssociar.push(permissao.sigla_permissao);
          } else if (perm.nome_permissao) {
            permissao = await Permissao.findOne({ where: { nome: perm.nome_permissao } });
            if (!permissao) {
              throw new Error(`Permissão com nome ${perm.nome_permissao} não encontrada`);
            }
            permissoesParaAssociar.push(permissao.sigla_permissao);
          }
        }

        await novoCargo.addPermissaos(permissoesParaAssociar, { transaction });
      }

      await transaction.commit();
      return this.getById(sigla_cargo);

    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erro ao criar cargo: ${error.message}`);
    }
  }

  async update(sigla_cargo, data) {
    const { nome, permissoes } = data;

    const cargo = await Cargo.findByPk(sigla_cargo);
    if (!cargo) {
      throw new Error('Cargo não encontrado');
    }

    if (nome && nome !== cargo.nome) {
      const nomeExiste = await Cargo.findOne({ 
        where: { 
          nome,
          sigla_cargo: { [Op.ne]: sigla_cargo }
        } 
      });
      if (nomeExiste) {
        throw new Error('Já existe um cargo com este nome');
      }
    }

    const transaction = await sequelize.transaction();

    try {
      if (nome) {
        await cargo.update({ nome }, { transaction });
      }

      if (permissoes !== undefined) {
        const permissoesParaAssociar = [];
        
        for (const perm of permissoes) {
          let permissao;
          if (perm.sigla_permissao) {
            permissao = await Permissao.findByPk(perm.sigla_permissao);
            if (!permissao) {
              throw new Error(`Permissão com sigla ${perm.sigla_permissao} não encontrada`);
            }
            permissoesParaAssociar.push(permissao.sigla_permissao);
          } else if (perm.nome_permissao) {
            permissao = await Permissao.findOne({ where: { nome: perm.nome_permissao } });
            if (!permissao) {
              throw new Error(`Permissão com nome ${perm.nome_permissao} não encontrada`);
            }
            permissoesParaAssociar.push(permissao.sigla_permissao);
          }
        }

        await cargo.setPermissaos(permissoesParaAssociar, { transaction });
      }

      await transaction.commit();
      return this.getById(sigla_cargo);

    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erro ao atualizar cargo: ${error.message}`);
    }
  }

  async delete(sigla_cargo) {
    const transaction = await sequelize.transaction();

    try {
      const contratoExistente = await Contrato.findOne({
        where: { sigla_cargo }
      });

      if (contratoExistente) {
        throw new Error('Não é possível excluir um cargo que está em uso em contratos');
      }

      const cargo = await Cargo.findByPk(sigla_cargo);
      if (!cargo) {
        throw new Error('Cargo não encontrado');
      }

      await cargo.setPermissaos([], { transaction }); // Remove todas as associações
      await Cargo.destroy({
        where: { sigla_cargo },
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erro ao deletar cargo: ${error.message}`);
    }
  }

  async list() {
    try {
      const cargos = await Cargo.findAll({
        include: [{
          model: Permissao,
          through: { attributes: [] }
        }]
      });

      return cargos.map(cargo => ({
        sigla_cargo: cargo.sigla_cargo,
        nome: cargo.nome,
        permissoes: cargo.Permissaos?.map(permissao => ({
          sigla: permissao.sigla_permissao,
          nome: permissao.nome
        })) || []
      }));
    } catch (error) {
      throw new Error(`Erro ao listar cargos: ${error.message}`);
    }
  }

  async getById(sigla_cargo) {
    try {
      const cargo = await Cargo.findOne({
        where: { sigla_cargo },
        include: [{
          model: Permissao,
          through: { attributes: [] }
        }]
      });

      if (!cargo) {
        throw new Error('Cargo não encontrado');
      }

      return {
        sigla_cargo: cargo.sigla_cargo,
        nome: cargo.nome,
        permissoes: cargo.Permissaos?.map(permissao => ({
          sigla: permissao.sigla_permissao,
          nome: permissao.nome
        })) || []
      };
    } catch (error) {
      throw new Error(`Erro ao buscar cargo: ${error.message}`);
    }
  }

  async listPermissions() {
    try {
      const permissions = await Permissao.findAll({
        attributes: ['sigla_permissao', 'nome', 'descricao'],
        order: [['nome', 'ASC']]
      });
  
      return permissions.map(permission => ({
        sigla: permission.sigla_permissao,
        nome: permission.nome,
        descricao: permission.descricao
      }));
    } catch (error) {
      throw new Error(`Erro ao listar permissões: ${error.message}`);
    }
  }
}

module.exports = new RoleService();