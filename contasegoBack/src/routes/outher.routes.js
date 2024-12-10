const router = require('express').Router();
const AdditionalController = require('../controllers/AdditionalController');
const authMiddleware = require('../middlewares/AuthMiddleware');

router.get(
  '/permissions/me',
  authMiddleware,
  AdditionalController.getUserPermissions
);

module.exports = router;
