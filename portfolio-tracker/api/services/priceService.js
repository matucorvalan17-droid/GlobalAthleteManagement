const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

const CRYPTO_ID_MAP = {
  BTC: 'bitcoin', ETH: 'ethereum', BNB: 'binancecoin', SOL: 'solana',
  ADA: 'cardano', XRP: 'ripple', DOT: 'polkadot', DOGE: 'dogecoin',
  AVAX: 'avalanche-2', MATIC: 'matic-network', LINK: 'chainlink',
  UNI: 'uniswap', LTC: 'litecoin', ATOM: 'cosmos', USDT: 'tether', USDC: 'usd-coin',
};

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function getCryptoPrices(symbols) {
  if (!symbols || symbols.length === 0) return {};
  const ids = symbols.map(s => CRYPTO_ID_MAP[s.toUpperCase()] || s.toLowerCase()).join(',');
  try {
    const data = await fetchJSON(
      `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    );
    const result = {};
    symbols.forEach(symbol => {
      const id = CRYPTO_ID_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
      if (data[id]) {
        result[symbol.toUpperCase()] = { price: data[id].usd, change24h: data[id].usd_24h_change || 0 };
      }
    });
    return result;
  } catch (err) {
    console.error('CoinGecko error:', err.message);
    return {};
  }
}

async function getStockPrices(symbols) {
  if (!symbols || symbols.length === 0) return {};
  const result = {};
  await Promise.all(
    symbols.map(async symbol => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`;
        const data = await fetchJSON(url);
        const meta = data?.chart?.result?.[0]?.meta;
        if (meta) {
          const currentPrice = meta.regularMarketPrice;
          const prevClose = meta.chartPreviousClose || meta.previousClose;
          const change24h = prevClose ? ((currentPrice - prevClose) / prevClose) * 100 : 0;
          result[symbol.toUpperCase()] = { price: currentPrice, change24h };
        }
      } catch (err) {
        console.error(`Yahoo Finance error for ${symbol}:`, err.message);
      }
    })
  );
  return result;
}

async function getPrices(assets) {
  const cryptoSymbols = assets.filter(a => a.asset_type === 'crypto').map(a => a.symbol);
  const stockSymbols = assets.filter(a => a.asset_type === 'stock').map(a => a.symbol);
  const [cryptoPrices, stockPrices] = await Promise.all([
    getCryptoPrices(cryptoSymbols),
    getStockPrices(stockSymbols),
  ]);
  return { ...cryptoPrices, ...stockPrices };
}

module.exports = { getPrices, getCryptoPrices, getStockPrices };
