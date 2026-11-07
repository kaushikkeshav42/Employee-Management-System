// Business layer: validation + rules, independent of HTTP.
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body) {
  const errors = [];
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const data = {
    name: str(body.name),
    email: str(body.email).toLowerCase(),
    department: str(body.department),
    role: str(body.role),
    salary: Number(body.salary),
  };
  if (data.name.length < 2) errors.push('name must be at least 2 characters');
  if (!EMAIL.test(data.email)) errors.push('email is invalid');
  if (!data.department) errors.push('department is required');
  if (!data.role) errors.push('role is required');
  if (!Number.isFinite(data.salary) || data.salary < 0) errors.push('salary must be a non-negative number');
  if (errors.length) throw new HttpError(400, 'Validation failed', errors);
  return data;
}

class EmployeeService {
  constructor(repo) {
    this.repo = repo;
  }

  list(query) {
    return this.repo.list(query);
  }

  get(id) {
    const e = this.repo.get(id);
    if (!e) throw new HttpError(404, 'Employee not found');
    return e;
  }

  create(body) {
    return this.#guardUnique(() => this.repo.create(validate(body)));
  }

  update(id, body) {
    const e = this.#guardUnique(() => this.repo.update(id, validate(body)));
    if (!e) throw new HttpError(404, 'Employee not found');
    return e;
  }

  remove(id) {
    if (!this.repo.remove(id)) throw new HttpError(404, 'Employee not found');
  }

  #guardUnique(fn) {
    try {
      return fn();
    } catch (err) {
      if (/UNIQUE/i.test(err.message)) throw new HttpError(409, 'Email already exists');
      throw err;
    }
  }
}

module.exports = { EmployeeService, HttpError };
