const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pessoa, Empresa, Contrato, CargoPermissao, Permissao } = require('../models');
const EmailService = require('./emailService');

class AuthService {
  constructor() {
    this.emailService = new EmailService();
  }

  async login(email, senha, cnpj_empresa = null) {
    const pessoa = await Pessoa.findOne({ where: { email } });
    if (!pessoa || !(await bcrypt.compare(senha, pessoa.senha))) {
      throw new Error('Credenciais inválidas');
    }

    if (pessoa.alterar_senha) {
      const token = jwt.sign({
        cpf: pessoa.cpf,
        nome: pessoa.nome,
        email: pessoa.email,
        permissoes: [{
          sigla: 'alterar_senha',
          nome: 'Alterar Senha'
        }]
      }, process.env.JWT_SECRET, { expiresIn: '30m' });

      return { token, alterar_senha: true };
    }

    let targetCnpj = cnpj_empresa;

    if (!targetCnpj) {
      targetCnpj = pessoa.ultima_empresa_acessada;
      
      if (!targetCnpj) {
        const primeiraEmpresa = await Contrato.findOne({
          where: { cpf_pessoa: pessoa.cpf },
          include: [{
            model: Empresa,
            attributes: ['cnpj', 'razao_social', 'email']
          }]
        });

        if (!primeiraEmpresa) {
          throw new Error('Usuário sem empresa associada. Entre em contato com o administrador do sistema.');
        }

        targetCnpj = primeiraEmpresa.Empresa.cnpj;
      }
    }

    const contrato = await Contrato.findOne({
      where: { 
        cpf_pessoa: pessoa.cpf,
        cnpj_empresa: targetCnpj
      },
      include: [{
        model: Empresa,
        attributes: ['razao_social', 'email']
      }]
    });

    if (!contrato) {
      throw new Error('Sem acesso a esta empresa');
    }

    const permissoes = await CargoPermissao.findAll({
      where: { sigla_cargo: contrato.sigla_cargo },
      include: [{
        model: Permissao,
        attributes: ['sigla_permissao', 'nome']
      }]
    });

    await Pessoa.update({
      data_ultimo_login: new Date(),
      ultima_empresa_acessada: targetCnpj
    }, {
      where: { cpf: pessoa.cpf }
    });

    const token = jwt.sign({
      cpf: pessoa.cpf,
      nome: pessoa.nome,
      email: pessoa.email,
      empresa: {
        cnpj: contrato.cnpj_empresa,
        razao_social: contrato.Empresa.razao_social,
        email: contrato.Empresa.email
      },
      cargo: contrato.sigla_cargo,
      permissoes: permissoes.map(p => ({
        sigla: p.Permissao.sigla_permissao,
        nome: p.Permissao.nome
      }))
    }, process.env.JWT_SECRET, { expiresIn: '30m' });

    return { token };
  }

  async changePassword(cpf, senhaAtual, novaSenha, isForced = false) {
    const pessoa = await Pessoa.findOne({ 
      where: { cpf },
      attributes: ['cpf', 'email', 'senha', 'alterar_senha']
    });
    
    if (!pessoa) {
      throw new Error('Usuário não encontrado');
    }

    if (!isForced && !pessoa.alterar_senha) {
      const senhaValida = await bcrypt.compare(senhaAtual, pessoa.senha);
      if (!senhaValida) {
        throw new Error('Senha atual incorreta');
      }
    }

    const senhaHash = await bcrypt.hash(novaSenha, 12);
    await Pessoa.update({
      senha: senhaHash,
      alterar_senha: false
    }, {
      where: { cpf }
    });

    return this.login(pessoa.email, novaSenha);
  }

  async recoverPassword(email) {
    const pessoa = await Pessoa.findOne({ where: { email } });
    if (!pessoa) {
      throw new Error('Email não encontrado');
    }

    const novaSenha = this.generateRandomPassword();
    const senhaHash = await bcrypt.hash(novaSenha, 12);

    await Pessoa.update({
      senha: senhaHash,
      alterar_senha: true
    }, {
      where: { email }
    });

    await this.emailService.sendPasswordRecovery(email, pessoa.nome, novaSenha);
    return { message: 'Nova senha enviada para seu email' };
  }

  async validateToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
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
}

module.exports = new AuthService();