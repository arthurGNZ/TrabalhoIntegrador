const router = require('express').Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middlewares/AuthMiddleware');

router.post('/login', AuthController.login);
router.post('/lost-password', AuthController.lostPassword);
router.post('/change-password', authMiddleware, AuthController.changePassword);
router.post('/change-company', authMiddleware, AuthController.changeCompany);

module.exports = router;