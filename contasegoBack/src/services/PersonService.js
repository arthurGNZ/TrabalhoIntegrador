const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');
const { Pessoa, Empresa, Cargo, Contrato, CargoPermissao, Permissao } = require('../models');
const EmailService = require('./emailService');

class PersonService {
  constructor() {
    this.emailService = new EmailService();
  }

  async create(data) {
    const { cpf, nome, email, data_nascimento, telefone_principal, telefone_secundario, empresas } = data;

    const pessoaExiste = await Pessoa.findOne({ where: { cpf } });
    if (pessoaExiste) {
      throw new Error('CPF já cadastrado no sistema');
    }

    const emailExiste = await Pessoa.findOne({ where: { email } });
    if (emailExiste) {
      throw new Error('Email já cadastrado no sistema');
    }

    if (empresas && empresas.length > 0) {
      for (const contrato of empresas) {
        const empresa = await Empresa.findByPk(contrato.cnpj_empresa);
        if (!empresa) {
          throw new Error(`Empresa com CNPJ ${contrato.cnpj_empresa} não encontrada`);
        }

        const cargo = await Cargo.findByPk(contrato.sigla_cargo);
        if (!cargo) {
          throw new Error(`Cargo ${contrato.sigla_cargo} não encontrado`);
        }
      }
    }

    const transaction = await sequelize.transaction();

    try {
      const senha = this.generateRandomPassword();
      const senhaHash = await bcrypt.hash(senha, 12);

      const novaPessoa = await Pessoa.create({
        cpf,
        nome,
        email,
        senha: senhaHash,
        alterar_senha: true,
        data_nascimento: data_nascimento || null,
        telefone_principal: telefone_principal || null,
        telefone_secundario: telefone_secundario || null,
        data_ultimo_login: null,
        ultima_empresa_acessada: null
      }, { transaction });

      if (empresas && empresas.length > 0) {
        const contratos = empresas.map(e => ({
          cpf_pessoa: cpf,
          cnpj_empresa: e.cnpj_empresa,
          sigla_cargo: e.sigla_cargo,
          data_contrato: new Date()
        }));

        await Contrato.bulkCreate(contratos, { transaction });
      }

      await this.emailService.sendWelcomeEmail(email, nome, senha);

      await transaction.commit();

      return this.formatPersonResponse(await this.getById(cpf));

    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erro ao criar pessoa: ${error.message}`);
    }
  }

  async update(cpf, data) {
    const { nome, email, data_nascimento, telefone_principal, telefone_secundario, empresas } = data;

    const pessoa = await Pessoa.findByPk(cpf);
    if (!pessoa) {
      throw new Error('Pessoa não encontrada');
    }

    if (email !== pessoa.email) {
      const emailExiste = await Pessoa.findOne({ 
        where: { 
          email,
          cpf: { [Op.ne]: cpf }
        } 
      });
      if (emailExiste) {
        throw new Error('Email já cadastrado no sistema');
      }
    }

    if (empresas) {
      for (const contrato of empresas) {
        const empresa = await Empresa.findByPk(contrato.cnpj_empresa);
        if (!empresa) {
          throw new Error(`Empresa com CNPJ ${contrato.cnpj_empresa} não encontrada`);
        }

        const cargo = await Cargo.findByPk(contrato.sigla_cargo);
        if (!cargo) {
          throw new Error(`Cargo ${contrato.sigla_cargo} não encontrado`);
        }
      }
    }

    const transaction = await sequelize.transaction();

    try {
      await pessoa.update({
        nome,
        email,
        data_nascimento: data_nascimento || null,
        telefone_principal: telefone_principal || null,
        telefone_secundario: telefone_secundario || null
      }, { transaction });

      if (empresas !== undefined) {
        await Contrato.destroy({
          where: { cpf_pessoa: cpf },
          transaction
        });

        if (empresas.length > 0) {
          const contratos = empresas.map(e => ({
            cpf_pessoa: cpf,
            cnpj_empresa: e.cnpj_empresa,
            sigla_cargo: e.sigla_cargo,
            data_contrato: new Date()
          }));

          await Contrato.bulkCreate(contratos, { transaction });
        }
      }

      await transaction.commit();

      return this.formatPersonResponse(await this.getById(cpf));

    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erro ao atualizar pessoa: ${error.message}`);
    }
  }

  async delete(cpf) {
    const transaction = await sequelize.transaction();

    try {
      const pessoa = await Pessoa.findByPk(cpf);
      if (!pessoa) {
        throw new Error('Pessoa não encontrada');
      }

      const admContratos = await Contrato.findAll({
        where: { cpf_pessoa: cpf },
        include: [{
          model: Cargo,
          required: true,
          include: [{
            model: CargoPermissao,
            required: true,
            include: [{
              model: Permissao,
              required: true,
              where: {
                sigla_permissao: 'ADM'
              }
            }]
          }]
        }]
      });

      if (admContratos.length > 0) {
        const empresasAdm = admContratos.map(contrato => contrato.cnpj_empresa);

        const outrosAdmins = await Contrato.count({
          where: {
            cnpj_empresa: { [Op.in]: empresasAdm },
            cpf_pessoa: { [Op.ne]: cpf }
          },
          include: [{
            model: Cargo,
            required: true,
            include: [{
              model: CargoPermissao,
              required: true,
              include: [{
                model: Permissao,
                required: true,
                where: {
                  sigla_permissao: 'ADM'
                }
              }]
            }]
          }]
        });

        if (outrosAdmins === 0) {
          throw new Error('Não é possível excluir o último usuário com permissão ADM');
        }
      }

      await Contrato.destroy({
        where: { cpf_pessoa: cpf },
        transaction
      });

      await Pessoa.destroy({
        where: { cpf },
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erro ao deletar pessoa: ${error.message}`);
    }
  }

  async list({ page, limit, search, sortField, sortOrder }) {
    const offset = (page - 1) * limit;
    
    const whereCondition = search ? {
      [Op.or]: [
        { nome: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    try {
      const { count, rows } = await Pessoa.findAndCountAll({
        where: whereCondition,
        offset,
        limit,
        distinct: true,
        include: [{
          model: Contrato,
          required: false,
          include: [
            {
              model: Empresa,
              attributes: ['cnpj', 'razao_social']
            },
            {
              model: Cargo,
              attributes: ['sigla_cargo', 'nome']
            }
          ]
        }],
        order: [[sortField, sortOrder.toUpperCase()]],
        attributes: {
          exclude: ['senha']
        }
      });

      const pessoas = rows.map(pessoa => this.formatPersonResponse(pessoa));

      return {
        pessoas,
        total: count
      };
    } catch (error) {
      throw new Error(`Erro ao listar pessoas: ${error.message}`);
    }
  }

  async getById(cpf) {
    try {
      const pessoa = await Pessoa.findOne({
        where: { cpf },
        include: [{
          model: Contrato,
          required: false,
          include: [
            {
              model: Empresa,
              attributes: ['cnpj', 'razao_social']
            },
            {
              model: Cargo,
              attributes: ['sigla_cargo', 'nome']
            }
          ]
        }],
        attributes: {
          exclude: ['senha']
        }
      });

      if (!pessoa) {
        throw new Error('Pessoa não encontrada');
      }

      return this.formatPersonResponse(pessoa);
    } catch (error) {
      throw new Error(`Erro ao buscar pessoa: ${error.message}`);
    }
  }

  formatPersonResponse(pessoa) {
    return {
      cpf: pessoa.cpf,
      nome: pessoa.nome,
      email: pessoa.email,
      data_nascimento: pessoa.data_nascimento,
      telefone_principal: pessoa.telefone_principal,
      telefone_secundario: pessoa.telefone_secundario,
      data_ultimo_login: pessoa.data_ultimo_login,
      ultima_empresa_acessada: pessoa.ultima_empresa_acessada,
      alterar_senha: pessoa.alterar_senha,
      contratos: (pessoa.Contratos || []).map(contrato => ({
        empresa: {
          cnpj: contrato.Empresa.cnpj,
          razao_social: contrato.Empresa.razao_social
        },
        cargo: {
          sigla: contrato.Cargo.sigla_cargo,
          nome: contrato.Cargo.nome
        }
      }))
    };
  }

  generateRandomPassword() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let senha = '';
    for (let i = 0; i < 10; i++) {
      senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return senha;
  }
}

module.exports = new PersonService();