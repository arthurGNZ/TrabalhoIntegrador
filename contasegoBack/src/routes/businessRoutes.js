const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.json({ message: "Empresa criada com sucesso", data: req.body });
});

router.put('/', (req, res) => {
  res.json({ message: "Empresa atualizada com sucesso", data: req.body });
});

router.get('/', (req, res) => {
  res.json({ message: "Lista de todas as empresas", data: [] });
});

module.exports = router;
