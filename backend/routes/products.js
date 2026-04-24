const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const auth = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    cb(null, allowed.test(file.mimetype));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const finalPrice = (price, promo) =>
  promo > 0 ? Math.round(price * (1 - promo / 100) * 100) / 100 : price;

router.get('/', (req, res) => {
  const { category_id } = req.query;
  let sql = `
    SELECT p.*, c.name AS category_name,
      CASE WHEN p.promo > 0 THEN ROUND(p.price * (1 - p.promo / 100.0), 2) ELSE p.price END AS final_price
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `;
  const params = [];
  if (category_id) {
    sql += ' WHERE p.category_id = ?';
    params.push(category_id);
  }
  sql += ' ORDER BY p.name';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
  res.json(product);
});

router.post('/', auth, upload.single('photo'), (req, res) => {
  const { name, description, price, promo, stock_status, category_id } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Nom et prix requis' });

  const photo = req.file ? `/uploads/${req.file.filename}` : null;
  const result = db.prepare(`
    INSERT INTO products (name, description, price, promo, stock_status, photo, category_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    name.trim(),
    description || null,
    parseFloat(price),
    parseInt(promo) || 0,
    stock_status || 'available',
    photo,
    category_id ? parseInt(category_id) : null,
  );
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', auth, upload.single('photo'), (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Produit non trouvé' });

  const { name, description, price, promo, stock_status, category_id } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : existing.photo;

  db.prepare(`
    UPDATE products SET name=?, description=?, price=?, promo=?, stock_status=?, photo=?, category_id=?
    WHERE id=?
  `).run(
    name?.trim() || existing.name,
    description !== undefined ? description : existing.description,
    price !== undefined ? parseFloat(price) : existing.price,
    promo !== undefined ? parseInt(promo) : existing.promo,
    stock_status || existing.stock_status,
    photo,
    category_id !== undefined ? (category_id ? parseInt(category_id) : null) : existing.category_id,
    req.params.id,
  );
  res.json({ success: true });
});

router.patch('/:id/stock', auth, (req, res) => {
  const { stock_status } = req.body;
  if (!['available', 'out_of_stock'].includes(stock_status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }
  db.prepare('UPDATE products SET stock_status=? WHERE id=?').run(stock_status, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', auth, (req, res) => {
  const product = db.prepare('SELECT photo FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

  if (product.photo) {
    const filePath = path.join(__dirname, '..', product.photo);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
