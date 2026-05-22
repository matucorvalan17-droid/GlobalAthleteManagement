const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

let initialized = false;

async function initDB() {
  if (initialized) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      symbol VARCHAR(20) NOT NULL,
      name VARCHAR(100),
      asset_type VARCHAR(10) NOT NULL CHECK (asset_type IN ('crypto', 'stock')),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, symbol)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
      type VARCHAR(10) NOT NULL CHECK (type IN ('buy', 'sell')),
      quantity DECIMAL(20, 8) NOT NULL,
      price_per_unit DECIMAL(20, 8) NOT NULL,
      total_amount DECIMAL(20, 8) NOT NULL,
      fee DECIMAL(20, 8) DEFAULT 0,
      date TIMESTAMP NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS portfolio_snapshots (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      total_value DECIMAL(20, 2) NOT NULL,
      snapshot_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, snapshot_date)
    );
  `);
  initialized = true;
}

module.exports = { pool, initDB };
