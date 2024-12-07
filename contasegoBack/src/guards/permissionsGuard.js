const permissionsGuard = (requiredPermissions) => {
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];

  return async (req, res, next) => {
    try {
      const userPermissions = req.user?.permissoes;
      
      if (!userPermissions || !Array.isArray(userPermissions)) {
        return res.status(403).json({ 
          error: 'Permissões não encontradas no token' 
        });
      }

      const hasAllPermissions = permissions.every(permission => 
        userPermissions.some(userPerm => 
          userPerm.sigla === permission
        )
      );

      if (!hasAllPermissions) {
        return res.status(403).json({ 
          error: 'Você não tem todas as permissões necessárias para acessar este recurso',
          required: permissions,
          userPermissions: userPermissions.map(p => p.sigla)
        });
      }

      next();
    } catch (error) {
      console.error('Erro no guard de permissões:', error);
      return res.status(403).json({ 
        error: 'Erro ao validar permissões' 
      });
    }
  };
};

module.exports = permissionsGuard;