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
    const { 
      cpf, 
      nome, 
      email, 
      data_nascimento, 
      telefone_principal, 
      telefone_secundario, 
      contratos 
    } = data;
  
    const pessoaExiste = await Pessoa.findOne({ where: { cpf } });
    if (pessoaExiste) {
      throw new Error('CPF já cadastrado no sistema');
    }
  
    const emailExiste = await Pessoa.findOne({ where: { email } });
    if (emailExiste) {
      throw new Error('Email já cadastrado no sistema');
    }
  
    if (contratos) {
      for (const contrato of contratos) {
        const empresa = await Empresa.findByPk(contrato.empresa.cnpj);
        if (!empresa) {
          throw new Error(`Empresa com CNPJ ${contrato.empresa.cnpj} não encontrada`);
        }
  
        const cargo = await Cargo.findByPk(contrato.cargo.sigla);
        if (!cargo) {
          throw new Error(`Cargo ${contrato.cargo.sigla} não encontrado`);
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
  
      if (contratos && contratos.length > 0) {
        const novosContratos = contratos.map(c => ({
          cpf_pessoa: cpf,
          cnpj_empresa: c.empresa.cnpj,
          sigla_cargo: c.cargo.sigla,
          data_contrato: new Date()
        }));
  
        await Contrato.bulkCreate(novosContratos, { transaction });
      }
  
      await this.emailService.sendWelcomeEmail(email, nome, senha);
  
      await transaction.commit();
  
      const pessoaCriada = await Pessoa.findOne({
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
          exclude: ['senha', 'alterar_senha', 'data_ultimo_login', 'ultima_empresa_acessada']
        }
      });
  
      return {
        nome: pessoaCriada.nome,
        email: pessoaCriada.email,
        data_nascimento: pessoaCriada.data_nascimento,
        telefone_principal: pessoaCriada.telefone_principal || null,
        telefone_secundario: pessoaCriada.telefone_secundario || null,
        contratos: pessoaCriada.Contratos.map(contrato => ({
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
  
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erro ao criar pessoa: ${error.message}`);
    }
  }
  
  async update(cpf, data) {
    const { nome, email, data_nascimento, telefone_principal, telefone_secundario, contratos } = data;
  
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
  
    const contratosAtuais = await Contrato.findAll({
      where: { cpf_pessoa: cpf },
      include: [{
        model: Cargo,
        required: true,
        include: [{
          model: CargoPermissao,
          required: true,
          where: {
            sigla_permissao: 'ADM'
          }
        }]
      }]
    });
  
    if (contratosAtuais.length > 0) {
      const cargosAdmAtuais = contratosAtuais.map(c => c.Cargo.sigla_cargo);
  
      const mantemAlgumCargoAdm = contratos?.some(c => cargosAdmAtuais.includes(c.cargo.sigla)) ?? false;
  
      if (!mantemAlgumCargoAdm) {
        const outrosContratosAdm = await Contrato.count({
          where: {
            cpf_pessoa: { [Op.ne]: cpf }
          },
          include: [{
            model: Cargo,
            required: true,
            include: [{
              model: CargoPermissao,
              required: true,
              where: {
                sigla_permissao: 'ADM'
              }
            }]
          }]
        });
  
        if (outrosContratosAdm === 0) {
          throw new Error('O sistema não pode ficar sem administradores');
        }
      }
    }
  
    if (contratos) {
      for (const contrato of contratos) {
        const empresa = await Empresa.findByPk(contrato.empresa.cnpj);
        if (!empresa) {
          throw new Error(`Empresa com CNPJ ${contrato.empresa.cnpj} não encontrada`);
        }
  
        const cargo = await Cargo.findByPk(contrato.cargo.sigla);
        if (!cargo) {
          throw new Error(`Cargo ${contrato.cargo.sigla} não encontrado`);
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
  
      if (contratos !== undefined) {
        await Contrato.destroy({
          where: { cpf_pessoa: cpf },
          transaction
        });
  
        if (contratos.length > 0) {
          const novosContratos = contratos.map(c => ({
            cpf_pessoa: cpf,
            cnpj_empresa: c.empresa.cnpj,
            sigla_cargo: c.cargo.sigla,
            data_contrato: new Date()
          }));
  
          await Contrato.bulkCreate(novosContratos, { transaction });
        }
      }
  
      await transaction.commit();
  
      const pessoaAtualizada = await Pessoa.findOne({
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
          exclude: ['senha', 'alterar_senha', 'data_ultimo_login', 'ultima_empresa_acessada']
        }
      });
  
      return {
        nome: pessoaAtualizada.nome,
        email: pessoaAtualizada.email,
        data_nascimento: pessoaAtualizada.data_nascimento,
        telefone_principal: pessoaAtualizada.telefone_principal || null,
        telefone_secundario: pessoaAtualizada.telefone_secundario || null,
        contratos: pessoaAtualizada.Contratos.map(contrato => ({
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

  async list() {
    try {
      const pessoas = await Pessoa.findAll({
        include: [{
          model: Contrato,
          required: false,
          include: [
            {
              model: Empresa,
              attributes: ['razao_social']
            },
            {
              model: Cargo,
              attributes: ['nome']
            }
          ]
        }],
        attributes: ['cpf', 'nome', 'email'],
        order: [['nome', 'ASC']]
      });
  
      return pessoas.map(pessoa => ({
        id: pessoa.cpf,
        name: pessoa.nome,
        email: pessoa.email,
        permissions: pessoa.Contratos.map(contrato => ({
          role: contrato.Cargo.nome,
          company: contrato.Empresa.razao_social
        }))
      }));
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
          exclude: ['senha', 'alterar_senha', 'data_ultimo_login', 'ultima_empresa_acessada']
        }
      });
  
      if (!pessoa) {
        throw new Error('Pessoa não encontrada');
      }
  
      return {
        nome: pessoa.nome,
        email: pessoa.email,
        data_nascimento: pessoa.data_nascimento,
        telefone_principal: pessoa.telefone_principal || null,
        telefone_secundario: pessoa.telefone_secundario || null,
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