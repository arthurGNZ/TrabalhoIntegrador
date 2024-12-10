const { CargoPermissao, Permissao } = require('../models');

class AdditionalService {
  async getUserPermissions(siglaCargo) {
    try {
      const cargoPermissoes = await CargoPermissao.findAll({
        where: { sigla_cargo: siglaCargo },
        include: [{
          model: Permissao,
          attributes: ['sigla_permissao', 'nome', 'descricao']
        }],
        attributes: []
      });

      if (!cargoPermissoes.length) {
        return [];
      }

      return cargoPermissoes.map(cp => ({
        sigla: cp.Permissao.sigla_permissao,
        nome: cp.Permissao.nome,
        descricao: cp.Permissao.descricao
      }));
    } catch (error) {
      throw new Error(`Erro ao buscar permissões do usuário: ${error.message}`);
    }
  }
}

module.exports = new AdditionalService();