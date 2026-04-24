const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET = process.env.JWT_SECRET || 'vap_lemeux_secret_key_2024';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Identifiants requis' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const token = jwt.sign({ id: admin.id, username: admin.username }, SECRET, { expiresIn: '24h' });
  res.json({ token, username: admin.username });
});

module.exports = router;
