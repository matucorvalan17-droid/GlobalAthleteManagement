require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json());

let dbReady = false;
app.use(async (req, res, next) => {
  if (!dbReady) {
    try {
      await initDB();
      dbReady = true;
    } catch (err) {
      console.error('DB init error:', err);
      return res.status(500).json({ error: 'Database unavailable' });
    }
  }
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/prices', require('./routes/prices'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

module.exports = app;
