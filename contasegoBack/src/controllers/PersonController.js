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
        message: 'Pessoa criada com sucesso',
        data: {
          cpf: person.cpf,
          nome: person.nome,
          email: person.email
        }
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
        message: 'Pessoa atualizada com sucesso',
        data: {
          cpf: updatedPerson.cpf,
          nome: updatedPerson.nome,
          email: updatedPerson.email
        }
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
}

module.exports = new PersonController();
