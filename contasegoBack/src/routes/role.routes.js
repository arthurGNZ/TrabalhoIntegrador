const router = require('express').Router();
const RoleController = require('../controllers/RoleController');
const authMiddleware = require('../middlewares/AuthMiddleware');
const permissionsGuard = require('../guards/permissionsGuard');

router.get(
  '/:sigla_cargo',
  authMiddleware,
  permissionsGuard('ADM'),
  RoleController.getById
);

router.get(
  '/',
  authMiddleware,
  permissionsGuard('ADM'),
  RoleController.list
);

router.post(
  '/', 
  authMiddleware, 
  permissionsGuard('ADM'),
  RoleController.create
);

router.put(
  '/:sigla_cargo',
  authMiddleware,
  permissionsGuard('ADM'),
  RoleController.update
);

router.delete(
  '/:sigla_cargo',
  authMiddleware,
  permissionsGuard('ADM'),
  RoleController.delete
);

router.get(
    '/permissions/list',
    authMiddleware,
    permissionsGuard('ADM'),
    RoleController.listPermissions
  );

module.exports = router;