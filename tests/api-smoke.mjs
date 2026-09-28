import assert from 'node:assert/strict';
import 'dotenv/config';
import mysql from 'mysql2/promise';

// Requires the local server and MySQL. Only the record created here is deleted.
const base = process.env.TEST_URL || 'http://127.0.0.1:3000';
const origin = process.env.TEST_ORIGIN || 'http://localhost:5173';
const db = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'basic_watch_shop'
});
async function request(path = '', method = 'GET', data) {
  const response = await fetch(`${base}/api/watches${path}`, {
    method,
    headers: { Origin: origin, ...(data === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: data === undefined ? undefined : JSON.stringify(data)
  });
  return { status: response.status, data: await response.json() };
}
let createdId;
try {
  const [info] = await db.query('SELECT DATABASE() AS db, @@port AS port, @@datadir AS dataDirectory');
  console.log('MySQL connection:', info[0]);
  const preflight = await fetch(`${base}/api/watches`, { method: 'OPTIONS', headers: {
    Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'
  } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
  const forbidden = await fetch(`${base}/api/watches`, { headers: { Origin: 'https://example.com' } });
  assert.equal(forbidden.status, 403);
  const before = await request();
  assert.equal(before.status, 200, JSON.stringify(before.data));
  assert.ok(Array.isArray(before.data));
  assert.equal((await request('/invalid')).status, 400);
  assert.equal((await request('', 'POST', {})).status, 422);
  const watch = { name: `CRUD smoke test ${Date.now()}`, brand: 'Test', category: 'Classic', price: '12.34', image: '', description: 'Temporary verification record.' };
  assert.equal((await request('', 'POST', { ...watch, price: '-1' })).status, 422);
  assert.equal((await request('', 'POST', { ...watch, image: 'javascript:alert(1)' })).status, 422);
  const created = await request('', 'POST', watch);
  assert.equal(created.status, 201, JSON.stringify(created.data));
  createdId = created.data.id;
  const [saved] = await db.execute('SELECT * FROM watches WHERE id = ?', [createdId]);
  assert.equal(saved[0].name, watch.name, 'Created watch must exist in MySQL');
  const read = await request(`/${createdId}`);
  assert.equal(read.data.name, watch.name);
  assert.equal(Number(read.data.price), 12.34);
  assert.ok((await request()).data.some(row => row.id === createdId));
  const updated = { ...watch, name: `${watch.name} edited`, price: '45.67' };
  assert.equal((await request(`/${createdId}`, 'PUT', updated)).status, 200);
  assert.equal((await request(`/${createdId}`, 'PUT', updated)).status, 200, 'Unchanged updates should succeed');
  assert.equal((await request(`/${createdId}`)).data.name, updated.name);
  const [changed] = await db.execute('SELECT * FROM watches WHERE id = ?', [createdId]);
  assert.equal(changed[0].name, updated.name);
  assert.equal(Number(changed[0].price), 45.67);
  assert.equal((await request(`/${createdId}`, 'DELETE')).status, 200);
  const [deleted] = await db.execute('SELECT * FROM watches WHERE id = ?', [createdId]);
  assert.equal(deleted.length, 0, 'Deleted watch must be removed from MySQL');
  assert.equal((await request(`/${createdId}`)).status, 404);
  assert.equal((await request(`/${createdId}`, 'PUT', updated)).status, 404);
  assert.equal((await request(`/${createdId}`, 'DELETE')).status, 404);
  createdId = undefined;
  assert.deepEqual((await request()).data, before.data, 'Existing watches should remain unchanged');
  assert.equal((await fetch(`${base}/`)).status, 200);
  const expressBase = process.env.EXPRESS_URL || 'http://127.0.0.1:3000';
  assert.equal((await fetch(`${expressBase}/.env`)).status, 404);
  assert.equal((await fetch(`${expressBase}/server.js`)).status, 404);
  console.log('PASS: CRUD persistence, validation, missing records, unchanged updates, and private file protection.');
} finally {
  try { if (createdId) await request(`/${createdId}`, 'DELETE'); }
  finally { await db.end(); }
}
