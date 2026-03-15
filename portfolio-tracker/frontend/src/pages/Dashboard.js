import React, { useEffect, useState, useCallback } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { portfolioAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatUSD, formatPct, formatChange } from '../utils/format';
import './Dashboard.css';

const COLORS = ['#6c63ff', '#00c853', '#ffb300', '#ff5252', '#00bcd4', '#e91e63', '#ff9800', '#4caf50'];

function StatCard({ label, value, sub, positive }) {
  return (
    <div className="stat-card card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub !== undefined && (
        <div className={`stat-sub ${positive === true ? 'positive' : positive === false ? 'negative' : 'neutral'}`}>
          {sub}
        </div>
      )}
    </div>
  );
}

function CustomTooltipPie({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{d.name}</div>
      <div className="tooltip-value">{formatUSD(d.value)}</div>
      <div className="tooltip-pct">{d.payload.pct?.toFixed(1)}% del portafolio</div>
    </div>
  );
}

function CustomTooltipArea({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{label}</div>
      <div className="tooltip-value">{formatUSD(payload[0].value)}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [portfolioRes, historyRes] = await Promise.all([
        portfolioAPI.getSummary(),
        portfolioAPI.getHistory(),
      ]);
      setPortfolio(portfolioRes.data);
      const historyData = historyRes.data.map(h => ({
        date: new Date(h.snapshot_date).toLocaleDateString('es', { month: 'short', day: 'numeric' }),
        value: parseFloat(h.total_value),
      }));
      setHistory(historyData);
    } catch {
      setError('Error al cargar el portafolio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="loading">Cargando portafolio...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  const isEmpty = !portfolio?.assets?.length;
  const totalValue = portfolio?.totalValue || 0;
  const totalPnL = portfolio?.totalPnL || 0;
  const totalPnLPercent = portfolio?.totalPnLPercent || 0;
  const totalInvested = portfolio?.totalInvested || 0;

  const pieData = (portfolio?.assets || []).map(a => ({
    name: a.symbol,
    value: a.currentValue,
    pct: totalValue > 0 ? (a.currentValue / totalValue) * 100 : 0,
  }));

  const topGainers = [...(portfolio?.assets || [])]
    .sort((a, b) => b.pnlPercent - a.pnlPercent)
    .slice(0, 5);

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Bienvenido, {user?.username} — aquí está tu resumen de inversiones</p>
        </div>
        <button className="btn btn-ghost" onClick={loadData}>↻ Actualizar</button>
      </div>

      {isEmpty ? (
        <div className="empty-state card">
          <h3>Tu portafolio está vacío</h3>
          <p>Ve a <strong>Transacciones</strong> para agregar tu primera compra.</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              label="Valor Total"
              value={formatUSD(totalValue)}
              sub={`Invertido: ${formatUSD(totalInvested)}`}
            />
            <StatCard
              label="Ganancia / Pérdida"
              value={formatUSD(totalPnL)}
              sub={formatPct(totalPnLPercent)}
              positive={totalPnL >= 0}
            />
            <StatCard
              label="Activos"
              value={portfolio.assets.length}
              sub="en portafolio"
            />
            <StatCard
              label="Mejor Activo"
              value={topGainers[0]?.symbol || '—'}
              sub={topGainers[0] ? formatChange(topGainers[0].pnlPercent) : ''}
              positive={topGainers[0]?.pnlPercent >= 0}
            />
          </div>

          <div className="charts-row">
            <div className="card chart-card">
              <h3 className="chart-title">Distribución del Portafolio</h3>
              <div className="pie-container">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltipPie />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="legend-item">
                      <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="legend-name">{d.name}</span>
                      <span className="legend-pct">{d.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {history.length > 1 && (
              <div className="card chart-card">
                <h3 className="chart-title">Evolución del Portafolio</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={history} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#8b8fa8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#8b8fa8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltipArea />} />
                    <Area type="monotone" dataKey="value" stroke="#6c63ff" strokeWidth={2} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="chart-title">Rendimiento por Activo</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Activo</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Precio Actual</th>
                    <th>Precio Prom. Compra</th>
                    <th>Valor Actual</th>
                    <th>Invertido</th>
                    <th>Ganancia/Pérdida</th>
                    <th>Cambio 24h</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.assets.map(asset => (
                    <tr key={asset.id}>
                      <td>
                        <div className="asset-name-cell">
                          <strong>{asset.symbol}</strong>
                          <span className="asset-name-sub">{asset.name}</span>
                        </div>
                      </td>
                      <td><span className={`badge badge-${asset.assetType}`}>{asset.assetType}</span></td>
                      <td>{parseFloat(asset.quantity).toFixed(asset.assetType === 'crypto' ? 6 : 2)}</td>
                      <td>{formatUSD(asset.currentPrice)}</td>
                      <td>{formatUSD(asset.avgBuyPrice)}</td>
                      <td><strong>{formatUSD(asset.currentValue)}</strong></td>
                      <td>{formatUSD(asset.totalInvested)}</td>
                      <td>
                        <div className={asset.pnl >= 0 ? 'positive' : 'negative'}>
                          <div>{formatUSD(asset.pnl)}</div>
                          <div style={{ fontSize: 12 }}>{formatChange(asset.pnlPercent)}</div>
                        </div>
                      </td>
                      <td className={asset.change24h >= 0 ? 'positive' : 'negative'}>
                        {formatChange(asset.change24h)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
