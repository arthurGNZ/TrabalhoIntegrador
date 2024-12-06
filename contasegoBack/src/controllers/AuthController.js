const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { email, senha, cnpj_empresa } = req.body;
      const result = await authService.login(email, senha, cnpj_empresa);
      return res.json(result);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      const { senha_atual, nova_senha } = req.body;
      const { cpf } = req.user;
      const result = await authService.changePassword(cpf, senha_atual, nova_senha);
      return res.json(result);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async lostPassword(req, res) {
    try {
      const { email } = req.body;
      await authService.recoverPassword(email);
      return res.json({ message: 'Nova senha enviada para seu email' });
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();