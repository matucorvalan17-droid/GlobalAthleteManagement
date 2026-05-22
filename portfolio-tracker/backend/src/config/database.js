const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'portfolio.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function convertSQL(sql, params = []) {
  const newParams = [];
  const converted = sql.replace(/\$(\d+)/g, (_, n) => {
    newParams.push(params[parseInt(n, 10) - 1]);
    return '?';
  });
  return { sql: converted, params: newParams };
}

function runQuery(sql, params = []) {
  const { sql: s, params: p } = convertSQL(sql, params);
  const trimmed = s.trim().toUpperCase();

  if (trimmed.startsWith('SELECT')) {
    return { rows: db.prepare(s).all(...p) };
  }

  const returning = s.match(/RETURNING\s+([\w\s,*]+)$/i);
  if (returning) {
    const baseSQL = s.replace(/\s*RETURNING\s+[\w\s,*]+$/i, '');
    const stmt = db.prepare(baseSQL);
    const info = stmt.run(...p);
    if (info.changes === 0) return { rows: [] };
    const table = s.match(/(?:INSERT INTO|UPDATE)\s+(\w+)/i)?.[1];
    const cols = returning[1].trim() === '*' ? '*' : returning[1].trim();
    const row = db.prepare(`SELECT ${cols} FROM ${table} WHERE rowid = ?`).get(info.lastInsertRowid);
    return { rows: row ? [row] : [] };
  }

  db.prepare(s).run(...p);
  return { rows: [] };
}

const pool = {
  async query(sql, params = []) {
    return runQuery(sql, params);
  },
  async connect() {
    return {
      query: async (sql, params = []) => runQuery(sql, params),
      release: () => {},
      async query(sql, params = []) { return runQuery(sql, params); },
    };
  },
};

// Override connect to support BEGIN/COMMIT/ROLLBACK
pool.connect = async function () {
  return {
    async query(sql, params = []) {
      const upper = sql.trim().toUpperCase();
      if (upper === 'BEGIN' || upper === 'COMMIT' || upper === 'ROLLBACK') {
        db.exec(upper);
        return { rows: [] };
      }
      return runQuery(sql, params);
    },
    release() {},
  };
};

async function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      symbol TEXT NOT NULL,
      name TEXT,
      asset_type TEXT NOT NULL CHECK (asset_type IN ('crypto', 'stock')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, symbol)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
      quantity REAL NOT NULL,
      price_per_unit REAL NOT NULL,
      total_amount REAL NOT NULL,
      fee REAL DEFAULT 0,
      date DATETIME NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS portfolio_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      total_value REAL NOT NULL,
      snapshot_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, snapshot_date)
    );
  `);
  console.log('Database initialized successfully');
}

module.exports = { pool, initDB };
