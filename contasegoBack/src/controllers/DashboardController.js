const dashboardService = require('../services/DashboardService');
const fs = require('fs-extra');

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
  
  async generateFiscalPDF(req, res) {
    try {
      const { empresa } = req.user;
      if (!empresa || !empresa.cnpj) {
        return res.status(400).json({ error: 'Empresa não identificada no token' });
      }

      const result = await dashboardService.generateFiscalPDF(empresa);
      
      // Send the file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);
      
      // Stream the file to the response
      const fileStream = fs.createReadStream(result.filePath);
      fileStream.pipe(res);
      
      // Delete the file after sending
      fileStream.on('end', () => {
        fs.unlinkSync(result.filePath);
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF fiscal:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  async generateDepartmentPDF(req, res) {
    try {
      const { empresa } = req.user;
      if (!empresa || !empresa.cnpj) {
        return res.status(400).json({ error: 'Empresa não identificada no token' });
      }

      const result = await dashboardService.generateDepartmentPDF(empresa);
      
      // Send the file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);
      
      // Stream the file to the response
      const fileStream = fs.createReadStream(result.filePath);
      fileStream.pipe(res);
      
      // Delete the file after sending
      fileStream.on('end', () => {
        fs.unlinkSync(result.filePath);
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF do departamento pessoal:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DashboardController();