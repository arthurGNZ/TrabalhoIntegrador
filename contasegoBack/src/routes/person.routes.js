const router = require('express').Router();
const PersonController = require('../controllers/PersonController');
const authMiddleware = require('../middlewares/AuthMiddleware');
const permissionsGuard = require('../guards/permissionsGuard');
router.get(
  '/:cpf',
  authMiddleware,
  permissionsGuard('ADM'),
  PersonController.getById
);

router.get(
  '/',
  authMiddleware,
  permissionsGuard('ADM'),
  PersonController.list
);

router.post(
  '/', 
  authMiddleware, 
  permissionsGuard('ADM'),
  PersonController.create
);

router.put(
  '/:cpf',
  authMiddleware,
  permissionsGuard('ADM'),
  PersonController.update
);

router.delete(
  '/:cpf',
  authMiddleware,
  permissionsGuard('ADM'),
  PersonController.delete
);


module.exports = router;
