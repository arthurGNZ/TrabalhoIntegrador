const dashboardService = require('../services/DashboardService');

class DashboardController {
  async getDepartmentData(req, res) {
    try {
      const { empresa } = req.user;
      if (!empresa || !empresa.cnpj) {
        return res.status(400).json({ error: 'Empresa não identificada no token' });
      }

      const data = await dashboardService.getDepartmentData(empresa);
      return res.json(data);
    } catch (error) {
      console.error('Erro ao buscar dados do departamento:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  async getFiscalData(req, res) {
    try {
      const { empresa } = req.user;
      if (!empresa || !empresa.cnpj) {
        return res.status(400).json({ error: 'Empresa não identificada no token' });
      }

      const data = await dashboardService.getFiscalData(empresa);
      return res.json(data);
    } catch (error) {
      console.error('Erro ao buscar dados fiscais:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DashboardController();
