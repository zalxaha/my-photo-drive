const express = require('express');
require('dotenv').config();

const router = express.Router();

// POST /api/login
router.post('/api/login', express.json(), (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ ok: false, error: 'Password diperlukan' });

  if (password === process.env.APP_PASSWORD) {
    return res.json({ ok: true });
  } else {
    return res.status(401).json({ ok: false, error: 'Password salah' });
  }
});

module.exports = router;
