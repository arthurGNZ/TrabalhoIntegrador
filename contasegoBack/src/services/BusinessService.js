const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Empresa: Business, Contrato } = require('../models');

class BusinessService {
  async create(data) {
    const { cnpj, razao_social, email, telefone1, telefone2 } = data;

    const businessExists = await Business.findOne({ where: { cnpj } });
    if (businessExists) {
      throw new Error('CNPJ já cadastrado no sistema');
    }

    const emailExists = await Business.findOne({ where: { email } });
    if (emailExists) {
      throw new Error('Email já cadastrado no sistema');
    }

    try {
      const newBusiness = await Business.create({
        cnpj,
        razao_social,
        email,
        telefone1: telefone1 || null,
        telefone2: telefone2 || null,
        data_criacao: new Date()
      });

      return this.formatBusinessResponse(await this.getById(cnpj));
    } catch (error) {
      throw new Error(`Erro ao criar empresa: ${error.message}`);
    }
  }

  async list({ page, limit, search, sortField, sortOrder }) {
    const offset = (page - 1) * limit;
    
    const whereCondition = search ? {
      [Op.or]: [
        { razao_social: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { cnpj: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    try {
      const { count, rows } = await Business.findAndCountAll({
        where: whereCondition,
        offset,
        limit,
        distinct: true,
        order: [[sortField, sortOrder.toUpperCase()]],
      });

      const businesses = rows.map(business => this.formatBusinessResponse(business));

      return {
        businesses,
        total: count
      };
    } catch (error) {
      throw new Error(`Erro ao listar empresas: ${error.message}`);
    }
  }

  async getById(cnpj) {
    try {
      const business = await Business.findOne({
        where: { cnpj }
      });

      if (!business) {
        throw new Error('Empresa não encontrada');
      }

      return this.formatBusinessResponse(business);
    } catch (error) {
      throw new Error(`Erro ao buscar empresa: ${error.message}`);
    }
  }

  async delete(cnpj) {
    const transaction = await sequelize.transaction();

    try {
      const business = await Business.findByPk(cnpj);
      if (!business) {
        throw new Error('Empresa não encontrada');
      }

      const contratosCount = await Contrato.count({
        where: { cnpj_empresa: cnpj }
      });

      if (contratosCount > 0) {
        throw new Error('Não é possível excluir empresa com usuários associados');
      }

      await Business.destroy({
        where: { cnpj },
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erro ao deletar empresa: ${error.message}`);
    }
  }

  async update(cnpj, data) {
    const { razao_social, email, telefone1, telefone2 } = data;

    const business = await Business.findByPk(cnpj);
    if (!business) {
      throw new Error('Empresa não encontrada');
    }

    if (email !== business.email) {
      const emailExists = await Business.findOne({ 
        where: { 
          email,
          cnpj: { [Op.ne]: cnpj }
        } 
      });
      if (emailExists) {
        throw new Error('Email já cadastrado no sistema');
      }
    }

    try {
      await business.update({
        razao_social,
        email,
        telefone1: telefone1 || null,
        telefone2: telefone2 || null
      });

      return this.formatBusinessResponse(await this.getById(cnpj));
    } catch (error) {
      throw new Error(`Erro ao atualizar empresa: ${error.message}`);
    }
  }

  formatBusinessResponse(business) {
    return {
      cnpj: business.cnpj,
      razao_social: business.razao_social,
      email: business.email,
      telefone1: business.telefone1,
      telefone2: business.telefone2,
      data_criacao: business.data_criacao
    };
  }
  
    async listShort(search = '', user) {
      try {
        let whereCondition = search ? {
          razao_social: { [Op.iLike]: `%${search}%` }
        } : {};
  
        if (!user?.permissoes) {
          throw new Error('Usuário não autorizado');
        }
  
        const isAdmin = user.permissoes.some(
          permissao => permissao.sigla === 'ADM'  
        );
  
        if (!isAdmin) {
          const userBusinesses = await Contrato.findAll({
            where: { cpf_pessoa: user.cpf },
            attributes: ['cnpj_empresa']
          });
  
          whereCondition = {
            ...whereCondition,
            cnpj: {
              [Op.in]: userBusinesses.map(contract => contract.cnpj_empresa)
            }
          };
        }
  
        const businesses = await Business.findAll({
          where: whereCondition,
          attributes: ['cnpj', 'razao_social'],
          order: [['razao_social', 'ASC']],
          limit: 50
        });
  
        return businesses.map(business => ({
          cnpj: business.cnpj,
          razao_social: business.razao_social
        }));
      } catch (error) {
        throw new Error(`Erro ao listar empresas: ${error.message}`);
      }
    }
  }  


module.exports = new BusinessService();