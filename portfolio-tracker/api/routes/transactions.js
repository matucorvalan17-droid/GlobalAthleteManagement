const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, a.symbol, a.name, a.asset_type
       FROM transactions t
       JOIN assets a ON t.asset_id = a.id
       WHERE t.user_id = $1
       ORDER BY t.date DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/asset/:assetId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, a.symbol, a.name, a.asset_type
       FROM transactions t
       JOIN assets a ON t.asset_id = a.id
       WHERE t.user_id = $1 AND t.asset_id = $2
       ORDER BY t.date DESC`,
      [req.userId, req.params.assetId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { symbol, name, assetType, type, quantity, pricePerUnit, fee = 0, date, notes } = req.body;

  if (!symbol || !assetType || !type || !quantity || !pricePerUnit || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const assetResult = await client.query(
      `INSERT INTO assets (user_id, symbol, name, asset_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, symbol) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [req.userId, symbol.toUpperCase(), name || symbol.toUpperCase(), assetType]
    );
    const assetId = assetResult.rows[0].id;
    const totalAmount = parseFloat(quantity) * parseFloat(pricePerUnit);

    const result = await client.query(
      `INSERT INTO transactions (user_id, asset_id, type, quantity, price_per_unit, total_amount, fee, date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.userId, assetId, type, quantity, pricePerUnit, totalAmount, fee, date, notes]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/import-csv', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const records = parse(req.file.buffer.toString(), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const required = ['symbol', 'asset_type', 'type', 'quantity', 'price_per_unit', 'date'];
    const firstRow = records[0];
    if (firstRow) {
      const missing = required.filter(f => !(f in firstRow));
      if (missing.length > 0) {
        return res.status(400).json({ error: `Missing CSV columns: ${missing.join(', ')}` });
      }
    }

    const client = await pool.connect();
    let imported = 0;
    const errors = [];

    try {
      await client.query('BEGIN');
      for (const [i, row] of records.entries()) {
        try {
          const assetResult = await client.query(
            `INSERT INTO assets (user_id, symbol, name, asset_type)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, symbol) DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [req.userId, row.symbol.toUpperCase(), row.name || row.symbol.toUpperCase(), row.asset_type]
          );
          const assetId = assetResult.rows[0].id;
          const total = parseFloat(row.quantity) * parseFloat(row.price_per_unit);
          await client.query(
            `INSERT INTO transactions (user_id, asset_id, type, quantity, price_per_unit, total_amount, fee, date, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [req.userId, assetId, row.type, row.quantity, row.price_per_unit, total, row.fee || 0, row.date, row.notes || null]
          );
          imported++;
        } catch (err) {
          errors.push(`Row ${i + 2}: ${err.message}`);
        }
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({ imported, errors: errors.length > 0 ? errors : undefined });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse CSV' });
  }
});

module.exports = router;
