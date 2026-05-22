const express = require('express');
const { pool } = require('../config/database');
const { getPrices } = require('../services/priceService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        a.id, a.symbol, a.name, a.asset_type,
        SUM(CASE WHEN t.type = 'buy' THEN t.quantity ELSE -t.quantity END) AS total_quantity,
        SUM(CASE WHEN t.type = 'buy' THEN t.total_amount ELSE 0 END) AS total_invested,
        SUM(CASE WHEN t.type = 'sell' THEN t.total_amount ELSE 0 END) AS total_sold,
        SUM(CASE WHEN t.type = 'buy' THEN t.quantity ELSE 0 END) AS total_bought_qty,
        COUNT(t.id) AS transaction_count
      FROM assets a
      LEFT JOIN transactions t ON a.id = t.asset_id
      WHERE a.user_id = $1
      GROUP BY a.id, a.symbol, a.name, a.asset_type
      HAVING SUM(CASE WHEN t.type = 'buy' THEN t.quantity ELSE -t.quantity END) > 0`,
      [req.userId]
    );

    const assets = result.rows;
    if (assets.length === 0) return res.json({ assets: [], totalValue: 0, totalInvested: 0, totalPnL: 0 });

    const prices = await getPrices(assets);

    let totalValue = 0;
    let totalInvested = 0;

    const enrichedAssets = assets.map(asset => {
      const priceData = prices[asset.symbol.toUpperCase()] || { price: 0, change24h: 0 };
      const currentPrice = priceData.price;
      const qty = parseFloat(asset.total_quantity);
      const invested = parseFloat(asset.total_invested) - parseFloat(asset.total_sold);
      const currentValue = qty * currentPrice;
      const avgBuyPrice = parseFloat(asset.total_bought_qty) > 0
        ? parseFloat(asset.total_invested) / parseFloat(asset.total_bought_qty)
        : 0;
      const pnl = currentValue - invested;
      const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

      totalValue += currentValue;
      totalInvested += invested;

      return {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        assetType: asset.asset_type,
        quantity: qty,
        currentPrice,
        change24h: priceData.change24h,
        currentValue,
        totalInvested: invested,
        avgBuyPrice,
        pnl,
        pnlPercent,
      };
    });

    const totalPnL = totalValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    await pool.query(
      `INSERT INTO portfolio_snapshots (user_id, total_value, snapshot_date)
       VALUES ($1, $2, CURRENT_DATE)
       ON CONFLICT (user_id, snapshot_date) DO UPDATE SET total_value = $2`,
      [req.userId, totalValue]
    );

    res.json({ assets: enrichedAssets, totalValue, totalInvested, totalPnL, totalPnLPercent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT snapshot_date, total_value
       FROM portfolio_snapshots
       WHERE user_id = $1
       ORDER BY snapshot_date ASC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/assets', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM assets WHERE user_id = $1 ORDER BY symbol',
      [req.userId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
