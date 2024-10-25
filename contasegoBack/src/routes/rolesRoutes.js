const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.json({ message: "Papel criado com sucesso", data: req.body });
});

router.put('/', (req, res) => {
  res.json({ message: "Papel atualizado com sucesso", data: req.body });
});

router.get('/', (req, res) => {
  res.json({ message: "Lista de todos os papéis", data: [] });
});

module.exports = router;
