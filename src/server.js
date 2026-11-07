const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { openDb } = require('./db');
const { EmployeeRepository } = require('./repository');
const { EmployeeService, HttpError } = require('./service');

const PUBLIC = path.join(__dirname, '..', 'public');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function send(res, status, payload) {
  if (payload === undefined) { res.writeHead(status); return res.end(); }
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1e6) reject(new HttpError(413, 'Payload too large'));
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(new HttpError(400, 'Invalid JSON')); }
    });
  });
}

function createServer(db = openDb()) {
  const service = new EmployeeService(new EmployeeRepository(db));

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const match = url.pathname.match(/^\/api\/employees(?:\/(\d+))?$/);

      if (match) {
        const id = match[1] ? Number(match[1]) : null;
        const q = Object.fromEntries(url.searchParams);
        if (!id && req.method === 'GET') return send(res, 200, service.list(q));
        if (!id && req.method === 'POST') return send(res, 201, service.create(await readJson(req)));
        if (id && req.method === 'GET') return send(res, 200, service.get(id));
        if (id && req.method === 'PUT') return send(res, 200, service.update(id, await readJson(req)));
        if (id && req.method === 'DELETE') { service.remove(id); return send(res, 204); }
        throw new HttpError(405, 'Method not allowed');
      }

      if (url.pathname.startsWith('/api/')) throw new HttpError(404, 'Route not found');

      // Static front-end
      const file = url.pathname === '/' ? 'index.html' : path.basename(url.pathname);
      const full = path.join(PUBLIC, file);
      if (fs.existsSync(full)) {
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(full)] || 'text/plain' });
        return fs.createReadStream(full).pipe(res);
      }
      throw new HttpError(404, 'Not found');
    } catch (err) {
      if (err instanceof HttpError) return send(res, err.status, { error: err.message, details: err.details });
      console.error(err);
      send(res, 500, { error: 'Internal server error' });
    }
  });
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => console.log(`Running at http://localhost:${port}`));
}

module.exports = { createServer };
