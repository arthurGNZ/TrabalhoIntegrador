const roleService = require('../services/RoleService');

class RoleController {
  async create(req, res) {
    try {
      const { sigla_cargo, nome, permissoes } = req.body;

      if (!sigla_cargo || !nome) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios não informados: sigla_cargo e nome são necessários' 
        });
      }

      if (permissoes && !Array.isArray(permissoes)) {
        return res.status(400).json({ 
          error: 'O campo permissões deve ser um array' 
        });
      }

      const role = await roleService.create({
        sigla_cargo,
        nome,
        permissoes
      });

      return res.status(201).json(role);
    } catch (error) {
      console.error('Erro ao criar cargo:', error);
      return res.status(error.status || 500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }

  async update(req, res) {
    try {
      const { sigla_cargo } = req.params;
      const { nome, permissoes } = req.body;

      if (!nome) {
        return res.status(400).json({ 
          error: 'Nome é obrigatório' 
        });
      }

      if (permissoes !== undefined && !Array.isArray(permissoes)) {
        return res.status(400).json({ 
          error: 'O campo permissões deve ser um array' 
        });
      }

      const updatedRole = await roleService.update(sigla_cargo, {
        nome,
        permissoes
      });

      return res.json(updatedRole);
    } catch (error) {
      console.error('Erro ao atualizar cargo:', error);
      return res.status(error.status || 500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }

  async delete(req, res) {
    try {
      const { sigla_cargo } = req.params;
      await roleService.delete(sigla_cargo);
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar cargo:', error);
      return res.status(error.status || 500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }

  async list(req, res) {
    try {
      const roles = await roleService.list();
      return res.json({ data: roles });
    } catch (error) {
      console.error('Erro ao listar cargos:', error);
      return res.status(error.status || 500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }

  async getById(req, res) {
    try {
      const { sigla_cargo } = req.params;
      const role = await roleService.getById(sigla_cargo);
      return res.json({ data: role });
    } catch (error) {
      console.error('Erro ao buscar cargo:', error);
      if (error.message === 'Cargo não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ 
        error: 'Erro interno do servidor' 
      });
    }
  }

  async listPermissions(req, res) {
    try {
      const permissions = await roleService.listPermissions();
      return res.json({ data: permissions });
    } catch (error) {
      console.error('Erro ao listar permissões:', error);
      return res.status(error.status || 500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }
}

module.exports = new RoleController();