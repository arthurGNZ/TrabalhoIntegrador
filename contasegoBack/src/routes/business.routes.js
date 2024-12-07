const router = require('express').Router();
const BusinessController = require('../controllers/BusinessController');
const authMiddleware = require('../middlewares/AuthMiddleware');
const permissionsGuard = require('../guards/permissionsGuard');


router.get(
    '/short',
    authMiddleware,
    BusinessController.listShort
  );


router.get(
  '/:cnpj',
  authMiddleware,
  permissionsGuard('ADM'),
  BusinessController.getById
);


router.get(
  '/',
  authMiddleware,
  permissionsGuard('ADM'),
  BusinessController.list
);



router.post(
  '/', 
  authMiddleware, 
  permissionsGuard('ADM'),
  BusinessController.create
);

router.put(
  '/:cnpj',
  authMiddleware,
  permissionsGuard('ADM'),
  BusinessController.update
);

router.delete(
  '/:cnpj',
  authMiddleware,
  permissionsGuard('ADM'),
  BusinessController.delete
);

module.exports = router;