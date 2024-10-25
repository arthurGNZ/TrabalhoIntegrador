const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.json({ message: "Usuário criado com sucesso", data: req.body });
});

router.put('/', (req, res) => {
  res.json({ message: "Usuário atualizado com sucesso", data: req.body });
});

router.get('/', (req, res) => {
  res.json({ message: "Lista de todos os usuários", data: [] });
});

router.get('/departaments', (req, res) => {
  res.json({ message: "Departamentos do usuário", data: [] });
});

module.exports = router;
