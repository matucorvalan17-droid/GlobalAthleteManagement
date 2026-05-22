const express = require('express');
const { getCryptoPrices, getStockPrices } = require('../services/priceService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/crypto', async (req, res) => {
  const symbols = req.query.symbols ? req.query.symbols.split(',') : [];
  if (symbols.length === 0) return res.status(400).json({ error: 'symbols query param required' });
  const prices = await getCryptoPrices(symbols);
  res.json(prices);
});

router.get('/stocks', async (req, res) => {
  const symbols = req.query.symbols ? req.query.symbols.split(',') : [];
  if (symbols.length === 0) return res.status(400).json({ error: 'symbols query param required' });
  const prices = await getStockPrices(symbols);
  res.json(prices);
});

router.get('/search', async (req, res) => {
  const { q, type } = req.query;
  if (!q) return res.status(400).json({ error: 'q query param required' });

  try {
    if (type === 'crypto' || !type) {
      const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`;
      const data = await fetch(url).then(r => r.json());
      const coins = (data.coins || []).slice(0, 10).map(c => ({
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        type: 'crypto',
        thumb: c.thumb,
      }));
      return res.json(coins);
    }

    if (type === 'stock') {
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10`;
      const data = await fetch(url).then(r => r.json());
      const quotes = (data.quotes || [])
        .filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
        .slice(0, 10)
        .map(q => ({
          symbol: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          type: 'stock',
          exchange: q.exchDisp,
        }));
      return res.json(quotes);
    }
  } catch (err) {
    return res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
