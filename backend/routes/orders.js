const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.post('/', (req, res) => {
  const { customer_name, customer_email, items } = req.body;
  if (!customer_name) return res.status(400).json({ error: 'Nom client requis' });
  if (!items || items.length === 0) return res.status(400).json({ error: 'Panier vide' });

  let total = 0;
  const resolvedItems = [];

  for (const item of items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
    if (!product) return res.status(400).json({ error: `Produit ${item.product_id} introuvable` });
    if (product.stock_status === 'out_of_stock') {
      return res.status(400).json({ error: `${product.name} est en rupture de stock` });
    }
    const unitPrice =
      product.promo > 0
        ? Math.round(product.price * (1 - product.promo / 100) * 100) / 100
        : product.price;
    total += unitPrice * item.quantity;
    resolvedItems.push({ product, quantity: item.quantity, unitPrice });
  }

  total = Math.round(total * 100) / 100;

  const orderResult = db.prepare(
    'INSERT INTO orders (customer_name, customer_email, total) VALUES (?, ?, ?)',
  ).run(customer_name, customer_email || null, total);

  const orderId = orderResult.lastInsertRowid;
  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
  );

  resolvedItems.forEach(({ product, quantity, unitPrice }) => {
    insertItem.run(orderId, product.id, product.name, quantity, unitPrice);
  });

  res.status(201).json({ id: orderId, total });
});

router.get('/', auth, (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM orders';
  const params = [];
  if (status && status !== 'all') {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', auth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
  res.json({ ...order, items });
});

router.put('/:id/validate', auth, (req, res) => {
  const order = db.prepare('SELECT id FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
  db.prepare("UPDATE orders SET status='validated' WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
