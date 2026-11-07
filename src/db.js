const { DatabaseSync } = require('node:sqlite');

function openDb(file = 'employees.db') {
  const db = new DatabaseSync(file);
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      role       TEXT NOT NULL,
      salary     REAL NOT NULL CHECK (salary >= 0),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
  return db;
}

module.exports = { openDb };
