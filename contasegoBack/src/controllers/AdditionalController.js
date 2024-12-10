const additionalService = require('../services/AdditionalService');

class AdditionalController {
  async getUserPermissions(req, res) {
    try {
      const { cargo } = req.user;

      if (!cargo) {
        return res.status(400).json({
          error: 'Cargo não encontrado no token'
        });
      }

      const permissions = await additionalService.getUserPermissions(cargo);
      return res.json(permissions);
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      return res.status(error.status || 500).json({
        error: error.message || 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new AdditionalController();