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
        contratos 
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
  
      if (contratos !== undefined) {
        if (!Array.isArray(contratos)) {
          return res.status(400).json({ 
            error: 'O campo contratos deve ser um array' 
          });
        }
  
        for (const contrato of contratos) {
          if (!contrato.empresa?.cnpj || !contrato.cargo?.sigla) {
            return res.status(400).json({ 
              error: 'Cada contrato deve conter empresa.cnpj e cargo.sigla' 
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
        contratos
      });
  
      return res.status(201).json(person);
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
        contratos 
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
  
      if (contratos !== undefined) {
        if (!Array.isArray(contratos)) {
          return res.status(400).json({ 
            error: 'O campo contratos deve ser um array' 
          });
        }
  
        for (const contrato of contratos) {
          if (!contrato.empresa?.cnpj || !contrato.cargo?.sigla) {
            return res.status(400).json({ 
              error: 'Cada contrato deve conter empresa.cnpj e cargo.sigla' 
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
        contratos
      });
  
      return res.json(updatedPerson);
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
      const result = await personService.list();
      return res.json(result);
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
      return res.json(person);
  
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
