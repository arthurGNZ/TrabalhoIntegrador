const express = require('express');
const router = express.Router();

router.get('/token', (req, res) => {
  res.json({ message: "Autenticado" });
});

router.get('/lostPassword', (req, res) => {
  res.json({ message: "Nova senha enviada para seu e-mail" });
});

module.exports = router;