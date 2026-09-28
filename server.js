import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import { resolve } from 'node:path';

const app = express();
const root = import.meta.dirname;

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'basic_watch_shop',
  charset: 'utf8mb4',
  connectionLimit: 5
});

// Request setup
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// Allow the local Vite frontend to use this API.
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');

  const origin = req.headers.origin;

  if (origin) {
    if (!/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin)) {
      return res.status(403).json({
        error: 'Only local development origins are allowed.'
      });
    }

    res.set('Access-Control-Allow-Origin', origin);
    res.vary('Origin');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Watch ID validation
app.param('id', (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id) || Number(id) > 4294967295) {
    return res.status(400).json({ error: 'Invalid watch ID.' });
  }

  next();
});

// Watch form validation
function validateWatch(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return 'Watch details are required.';
  }

  for (const [field, limit] of Object.entries({
    name: 150,
    brand: 100,
    category: 100,
    image: 2048,
    description: 16000
  })) {
    if (
      typeof data[field] !== 'string' ||
      (field !== 'image' && !data[field].trim()) ||
      [...data[field].trim()].length > limit
    ) {
      return `${field} must be ${field === 'image' ? 'at most' : 'between 1 and'} ${limit} characters.`;
    }

    data[field] = data[field].trim();
  }

  if (!['Classic', 'Sport', 'Luxury'].includes(data.category)) {
    return 'Choose a valid category.';
  }

  if (
    !['string', 'number'].includes(typeof data.price) ||
    !/^\d{1,8}(\.\d{1,2})?$/.test(String(data.price))
  ) {
    return 'Enter a price from 0 to 99999999.99 with at most two decimal places.';
  }

  if (data.image) {
    try {
      if (!['http:', 'https:'].includes(new URL(data.image).protocol)) {
        return 'Use an HTTP or HTTPS image URL.';
      }
    } catch {
      return 'Enter a valid image URL.';
    }
  }

  return null;
}

const fields = data => [
  data.name,
  data.brand,
  data.category,
  data.price,
  data.image,
  data.description
];

// Check form data before adding or updating a watch.
app.use('/api/watches', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const error = validateWatch(req.body);

    if (error) {
      return res.status(422).json({ error });
    }
  }

  next();
});

// READ: list all watches.
app.get('/api/watches', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM watches ORDER BY id DESC');

  res.json(rows);
});

// READ: show one watch.
app.get('/api/watches/:id', async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM watches WHERE id = ?',
    [req.params.id]
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'Watch record not found.' });
  }

  res.json(rows[0]);
});

// CREATE: save a new watch.
app.post('/api/watches', async (req, res) => {
  const [result] = await pool.execute(
    'INSERT INTO watches (name, brand, category, price, image, description) VALUES (?, ?, ?, ?, ?, ?)',
    fields(req.body)
  );

  res.status(201).json({ id: result.insertId });
});

// UPDATE: save edits to an existing watch.
app.put('/api/watches/:id', async (req, res) => {
  const [result] = await pool.execute(
    'UPDATE watches SET name = ?, brand = ?, category = ?, price = ?, image = ?, description = ? WHERE id = ?',
    [...fields(req.body), req.params.id]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ error: 'Watch record not found.' });
  }

  res.json({ id: Number(req.params.id) });
});

// DELETE: remove a watch.
app.delete('/api/watches/:id', async (req, res) => {
  const [result] = await pool.execute(
    'DELETE FROM watches WHERE id = ?',
    [req.params.id]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ error: 'Watch record not found.' });
  }

  res.json({ message: 'Watch deleted.' });
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// Public pages and assets
for (const page of [
  'index.html',
  'products.html',
  'product-details.html',
  'product-form.html'
]) {
  app.get(
    page === 'index.html' ? ['/', '/index.html'] : `/${page}`,
    (req, res) => res.sendFile(resolve(root, page))
  );
}

app.use('/css', express.static(resolve(root, 'css')));
app.use('/js', express.static(resolve(root, 'js')));

// Error handling
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request is too large.' });
  }

  console.error(error.code || error.message);

  res.status(500).json({
    error: 'Database request failed. Check XAMPP MySQL and your .env database settings.'
  });
});

// Start the server
const server = app.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => {
  console.log(`Watch shop: http://127.0.0.1:${server.address().port}`);
});

async function shutdown() {
  server.close();
  await pool.end();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
