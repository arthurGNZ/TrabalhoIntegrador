const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');
const { Pessoa, Empresa, Cargo, Contrato } = require('../models');
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
      return novaPessoa;

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
      const emailExiste = await Pessoa.findOne({ where: { email } });
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
      return pessoa;

    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erro ao atualizar pessoa: ${error.message}`);
    }
  }

  generateRandomPassword() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let senha = '';
    for (let i = 0; i < 10; i++) {
      senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return senha;
  }



  async delete(cpf) {
    const transaction = await sequelize.transaction();

    try {
      const pessoa = await Pessoa.findByPk(cpf);
      if (!pessoa) {
        throw new Error('Pessoa não encontrada');
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

}

module.exports = new PersonService();
