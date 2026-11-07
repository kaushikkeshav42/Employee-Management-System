// Data-access layer: the only place that talks SQL.
class EmployeeRepository {
  constructor(db) {
    this.db = db;
  }

  list({ department, search } = {}) {
    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params = [];
    if (department) { sql += ' AND department = ?'; params.push(department); }
    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    return this.db.prepare(sql + ' ORDER BY id').all(...params);
  }

  get(id) {
    return this.db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  }

  create(e) {
    const r = this.db
      .prepare('INSERT INTO employees (name, email, department, role, salary) VALUES (?, ?, ?, ?, ?)')
      .run(e.name, e.email, e.department, e.role, e.salary);
    return this.get(Number(r.lastInsertRowid));
  }

  update(id, e) {
    const r = this.db
      .prepare('UPDATE employees SET name=?, email=?, department=?, role=?, salary=? WHERE id=?')
      .run(e.name, e.email, e.department, e.role, e.salary, id);
    return r.changes ? this.get(id) : undefined;
  }

  remove(id) {
    return this.db.prepare('DELETE FROM employees WHERE id = ?').run(id).changes > 0;
  }
}

module.exports = { EmployeeRepository };
