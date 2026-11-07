const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { openDb } = require('../src/db');
const { createServer } = require('../src/server');

let server, base;
const emp = { name: 'Asha Verma', email: 'asha@example.com', department: 'Engineering', role: 'Developer', salary: 600000 };
const call = (p, opts = {}) =>
  fetch(base + p, { headers: { 'Content-Type': 'application/json' }, ...opts });

before(async () => {
  server = createServer(openDb(':memory:'));
  await new Promise((r) => server.listen(0, r));
  base = `http://localhost:${server.address().port}`;
});
after(() => server.close());

test('creates and fetches an employee', async () => {
  const res = await call('/api/employees', { method: 'POST', body: JSON.stringify(emp) });
  assert.equal(res.status, 201);
  const created = await res.json();
  const got = await (await call(`/api/employees/${created.id}`)).json();
  assert.equal(got.email, 'asha@example.com');
});

test('rejects invalid input with 400', async () => {
  const res = await call('/api/employees', { method: 'POST', body: JSON.stringify({ ...emp, email: 'bad', salary: -1 }) });
  assert.equal(res.status, 400);
  assert.ok((await res.json()).details.length >= 2);
});

test('rejects duplicate email with 409', async () => {
  const res = await call('/api/employees', { method: 'POST', body: JSON.stringify(emp) });
  assert.equal(res.status, 409);
});

test('updates, filters and deletes', async () => {
  const upd = await call('/api/employees/1', { method: 'PUT', body: JSON.stringify({ ...emp, role: 'Senior Developer' }) });
  assert.equal((await upd.json()).role, 'Senior Developer');
  assert.equal((await (await call('/api/employees?department=Engineering')).json()).length, 1);
  assert.equal((await (await call('/api/employees?search=nobody')).json()).length, 0);
  assert.equal((await call('/api/employees/1', { method: 'DELETE' })).status, 204);
  assert.equal((await call('/api/employees/1')).status, 404);
});
