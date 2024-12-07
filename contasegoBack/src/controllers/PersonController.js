const personService = require('../services/PersonService');

class PersonController {
  async create(req, res) {
    try {
      const { 
        cpf, 
        nome, 
        email, 
        data_nascimento, 
        telefone_principal, 
        telefone_secundario, 
        empresas 
      } = req.body;

      if (!cpf || !nome || !email) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios não informados: cpf, nome e email são necessários' 
        });
      }

      if (!/^\d{11}$/.test(cpf)) {
        return res.status(400).json({ 
          error: 'CPF deve conter 11 dígitos numéricos' 
        });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ 
          error: 'Formato de email inválido' 
        });
      }

      if (empresas) {
        if (!Array.isArray(empresas)) {
          return res.status(400).json({ 
            error: 'O campo empresas deve ser um array' 
          });
        }

        for (const empresa of empresas) {
          if (!empresa.cnpj_empresa || !empresa.sigla_cargo) {
            return res.status(400).json({ 
              error: 'Cada empresa deve conter cnpj_empresa e sigla_cargo' 
            });
          }
        }
      }

      const person = await personService.create({
        cpf,
        nome,
        email,
        data_nascimento,
        telefone_principal,
        telefone_secundario,
        empresas
      });

      return res.status(201).json({
        cpf: person.cpf,
        nome: person.nome,
        email: person.email
      });
    } catch (error) {
      console.error('Erro ao criar pessoa:', error);
      return res.status(error.status || 500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }

  async update(req, res) {
    try {
      const { cpf } = req.params;
      const { 
        nome, 
        email, 
        data_nascimento, 
        telefone_principal, 
        telefone_secundario, 
        empresas 
      } = req.body;

      if (!nome || !email) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios não informados: nome e email são necessários' 
        });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ 
          error: 'Formato de email inválido' 
        });
      }

      if (empresas !== undefined) {
        if (!Array.isArray(empresas)) {
          return res.status(400).json({ 
            error: 'O campo empresas deve ser um array' 
          });
        }

        for (const empresa of empresas) {
          if (!empresa.cnpj_empresa || !empresa.sigla_cargo) {
            return res.status(400).json({ 
              error: 'Cada empresa deve conter cnpj_empresa e sigla_cargo' 
            });
          }
        }
      }

      const updatedPerson = await personService.update(cpf, {
        nome,
        email,
        data_nascimento,
        telefone_principal,
        telefone_secundario,
        empresas
      });

      return res.json({
        cpf: updatedPerson.cpf,
        nome: updatedPerson.nome,
        email: updatedPerson.email
      });
    } catch (error) {
      console.error('Erro ao atualizar pessoa:', error);
      return res.status(error.status || 500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }

  async delete(req, res) {
    try {
      const { cpf } = req.params;

      if (!cpf || !/^\d{11}$/.test(cpf)) {
        return res.status(400).json({ 
          error: 'CPF inválido'
        });
      }

      await personService.delete(cpf);
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar pessoa:', error);
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
        sortField = 'nome',
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

      if (!['nome', 'email', 'cpf'].includes(options.sortField)) {
        return res.status(400).json({
          error: 'Campo de ordenação inválido. Deve ser "nome", "email" ou "cpf"'
        });
      }

      const result = await personService.list(options);

      return res.json({
        data: result.pessoas,
        pagination: {
          total: result.total,
          totalPages: Math.ceil(result.total / options.limit),
          currentPage: options.page,
          limit: options.limit
        }
      });
    } catch (error) {
      console.error('Erro ao listar pessoas:', error);
      return res.status(error.status || 500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }

  async getById(req, res) {
    try {
      const { cpf } = req.params;
  
      if (!cpf || !/^\d{11}$/.test(cpf)) {
        return res.status(400).json({ 
          error: 'CPF inválido'
        });
      }
  
      const person = await personService.getById(cpf);
      return res.json({ data: person });
  
    } catch (error) {
      console.error('Erro ao buscar pessoa:', error);
      
      if (error.message === 'Pessoa não encontrada') {
        return res.status(404).json({ error: error.message });
      }
      
      return res.status(500).json({ 
        error: 'Erro interno do servidor' 
      });
    }
  }

  
}

module.exports = new PersonController();
