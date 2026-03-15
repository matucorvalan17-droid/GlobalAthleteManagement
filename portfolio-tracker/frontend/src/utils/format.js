export function formatUSD(value) {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

export function formatPct(value) {
  if (!value && value !== 0) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatChange(value) {
  if (!value && value !== 0) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
