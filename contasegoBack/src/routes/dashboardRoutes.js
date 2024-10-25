const express = require('express');
const router = express.Router();

router.get('/personalDepartament', (req, res) => {
  res.json({ message: "Dashboard do departamento pessoal", data: {} });
});

router.get('/financial', (req, res) => {
  res.json({ message: "Dashboard financeiro", data: {} });
});

module.exports = router;
