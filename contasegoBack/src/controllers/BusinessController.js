const businessService = require('../services/BusinessService');

class BusinessController {
  async create(req, res) {
    try {
      const { 
        cnpj, 
        razao_social, 
        email, 
        telefone1, 
        telefone2
      } = req.body;

      if (!cnpj || !razao_social || !email) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios não informados: cnpj, razao_social e email são necessários' 
        });
      }

      if (!/^\d{14}$/.test(cnpj)) {
        return res.status(400).json({ 
          error: 'CNPJ deve conter 14 dígitos numéricos' 
        });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ 
          error: 'Formato de email inválido' 
        });
      }

      const business = await businessService.create({
        cnpj,
        razao_social,
        email,
        telefone1,
        telefone2
      });

      return res.status(201).json(business);
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      return res.status(error.status || 500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }

  async list(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '',
        sortField = 'razao_social',
        sortOrder = 'asc'
      } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search: search.trim(),
        sortField,
        sortOrder: sortOrder.toLowerCase()
      };

      if (options.page < 1 || options.limit < 1 || options.limit > 100) {
        return res.status(400).json({
          error: 'Parâmetros de paginação inválidos. Page deve ser >= 1 e limit entre 1 e 100'
        });
      }

      if (!['asc', 'desc'].includes(options.sortOrder)) {
        return res.status(400).json({
          error: 'Ordenação deve ser "asc" ou "desc"'
        });
      }

      if (!['razao_social', 'email', 'cnpj'].includes(options.sortField)) {
        return res.status(400).json({
          error: 'Campo de ordenação inválido. Deve ser "razao_social", "email" ou "cnpj"'
        });
      }

      const result = await businessService.list(options);

      return res.json({
        data: result.businesses,
        pagination: {
          total: result.total,
          totalPages: Math.ceil(result.total / options.limit),
          currentPage: options.page,
          limit: options.limit
        }
      });
    } catch (error) {
      console.error('Erro ao listar empresas:', error);
      return res.status(error.status || 500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }

  async getById(req, res) {
    try {
      const { cnpj } = req.params;
  
      if (!cnpj || !/^\d{14}$/.test(cnpj)) {
        return res.status(400).json({ 
          error: 'CNPJ inválido'
        });
      }
  
      const business = await businessService.getById(cnpj);
      return res.json({ data: business });
  
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      
      if (error.message === 'Empresa não encontrada') {
        return res.status(404).json({ error: error.message });
      }
      
      return res.status(500).json({ 
        error: 'Erro interno do servidor' 
      });
    }
  }

  async delete(req, res) {
    try {
      const { cnpj } = req.params;

      if (!cnpj || !/^\d{14}$/.test(cnpj)) {
        return res.status(400).json({ 
          error: 'CNPJ inválido'
        });
      }

      await businessService.delete(cnpj);
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      return res.status(error.status || 500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }

  async update(req, res) {
    try {
      const { cnpj } = req.params;
      const { 
        razao_social, 
        email, 
        telefone1, 
        telefone2 
      } = req.body;

      if (!razao_social || !email) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios não informados: razao_social e email são necessários' 
        });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ 
          error: 'Formato de email inválido' 
        });
      }

      const updatedBusiness = await businessService.update(cnpj, {
        razao_social,
        email,
        telefone1,
        telefone2
      });

      return res.json(updatedBusiness);
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      return res.status(error.status || 500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }

  async listShort(req, res) {
    try {
      const { search = '' } = req.query;
      const businesses = await businessService.listShort(search, req.user);
      return res.json({ data: businesses });
    } catch (error) {
      console.error('Erro ao listar empresas:', error);
      return res.status(500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }  
}

module.exports = new BusinessController();