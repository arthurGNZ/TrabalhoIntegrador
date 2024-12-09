const router = require('express').Router();
const DashboardController = require('../controllers/DashboardController');
const authMiddleware = require('../middlewares/AuthMiddleware');
const permissionsGuard = require('../guards/permissionsGuard');

router.get(
 '/departamento-pessoal',
 authMiddleware,
 permissionsGuard('DP'),
 DashboardController.getDepartmentData
);

router.get(
 '/departamento-fiscal',
 authMiddleware,
 permissionsGuard('DF'),
 DashboardController.getFiscalData
);

module.exports = router;