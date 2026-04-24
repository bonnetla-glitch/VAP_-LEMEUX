const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, 'database.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    promo INTEGER DEFAULT 0,
    stock_status TEXT DEFAULT 'available' CHECK(stock_status IN ('available', 'out_of_stock')),
    photo TEXT,
    category_id INTEGER REFERENCES categories(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'validated')),
    total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);

const adminExists = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
if (!adminExists) {
  const hashed = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', hashed);
}

const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (catCount.count === 0) {
  const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
  ['Boissons', 'Snacks', 'Plats chauds', 'Desserts'].forEach(name => insertCat.run(name));
}

module.exports = db;
