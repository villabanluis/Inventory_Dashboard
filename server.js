const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

// ---------- Database ----------
const db = new Database(path.join(__dirname, 'inventory.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL
  )
`);

// ---------- Middleware ----------
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple validation helper
function validate(body) {
  const { name, category, price, quantity } = body;
  if (!name || !category) return 'Name and category are required';
  if (isNaN(price) || Number(price) < 0) return 'Price must be a positive number';
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0)
    return 'Quantity must be a whole number (0 or more)';
  return null;
}

// ---------- READ ----------
app.get('/api/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
  res.json(rows);
});

// Dashboard statistics
app.get('/api/stats', (req, res) => {
  const totals = db
    .prepare(
      `SELECT COUNT(*) AS totalProducts,
              COALESCE(SUM(price * quantity), 0) AS totalValue,
              COALESCE(SUM(CASE WHEN quantity <= 10 THEN 1 ELSE 0 END), 0) AS lowStock
       FROM products`
    )
    .get();
  const byCategory = db
    .prepare('SELECT category, COUNT(*) AS count FROM products GROUP BY category')
    .all();
  res.json({ ...totals, byCategory });
});

// ---------- CREATE ----------
app.post('/api/products', (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });

  const { name, category, price, quantity } = req.body;
  const result = db
    .prepare('INSERT INTO products (name, category, price, quantity) VALUES (?, ?, ?, ?)')
    .run(name.trim(), category.trim(), Number(price), Number(quantity));
  res.status(201).json({ id: result.lastInsertRowid });
});

// ---------- UPDATE ----------
app.put('/api/products/:id', (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });

  const { name, category, price, quantity } = req.body;
  const result = db
    .prepare('UPDATE products SET name = ?, category = ?, price = ?, quantity = ? WHERE id = ?')
    .run(name.trim(), category.trim(), Number(price), Number(quantity), req.params.id);

  if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Updated' });
});

// ---------- DELETE ----------
app.delete('/api/products/:id', (req, res) => {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Deleted' });
});

app.listen(PORT, () => {
  console.log(`Dashboard running at http://localhost:${PORT}`);
});
