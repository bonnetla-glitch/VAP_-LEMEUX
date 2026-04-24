const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(categories);
});

router.post('/', auth, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom requis' });
  const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name.trim());
  res.status(201).json({ id: result.lastInsertRowid, name: name.trim() });
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').run(req.params.id);
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
