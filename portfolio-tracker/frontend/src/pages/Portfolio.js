import React, { useEffect, useState, useCallback } from 'react';
import { portfolioAPI, transactionsAPI } from '../services/api';
import { formatUSD, formatChange, formatDate } from '../utils/format';
import TransactionModal from '../components/portfolio/TransactionModal';
import './Portfolio.css';

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetTxs, setAssetTxs] = useState([]);
  const [loadingTxs, setLoadingTxs] = useState(false);

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await portfolioAPI.getSummary();
      setPortfolio(data);
    } catch {
      setError('Error al cargar portafolio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPortfolio(); }, [loadPortfolio]);

  async function handleAssetClick(asset) {
    setSelectedAsset(asset);
    setLoadingTxs(true);
    try {
      const { data } = await transactionsAPI.getByAsset(asset.id);
      setAssetTxs(data);
    } catch {}
    setLoadingTxs(false);
  }

  function handleTransactionAdded() {
    setShowModal(false);
    loadPortfolio();
    if (selectedAsset) handleAssetClick(selectedAsset);
  }

  if (loading) return <div className="loading">Cargando portafolio...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="portfolio-page">
      <div className="page-header">
        <div>
          <h1>Portafolio</h1>
          <p className="page-subtitle">Detalle de todos tus activos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Agregar Transacción
        </button>
      </div>

      {!portfolio?.assets?.length ? (
        <div className="empty-state card">
          <h3>Sin activos aún</h3>
          <p>Agrega tu primera transacción para comenzar a rastrear tu portafolio.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
            + Primera Transacción
          </button>
        </div>
      ) : (
        <div className="portfolio-layout">
          <div className="assets-list card">
            <h3 className="section-title">Mis Activos</h3>
            {portfolio.assets.map(asset => (
              <div
                key={asset.id}
                className={`asset-item ${selectedAsset?.id === asset.id ? 'active' : ''}`}
                onClick={() => handleAssetClick(asset)}
              >
                <div className="asset-header">
                  <div>
                    <div className="asset-symbol">{asset.symbol}</div>
                    <div className="asset-name-sub">{asset.name}</div>
                  </div>
                  <span className={`badge badge-${asset.assetType}`}>{asset.assetType}</span>
                </div>
                <div className="asset-metrics">
                  <div className="metric">
                    <span className="metric-label">Valor actual</span>
                    <span className="metric-value">{formatUSD(asset.currentValue)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">P&L</span>
                    <span className={`metric-value ${asset.pnl >= 0 ? 'positive' : 'negative'}`}>
                      {formatUSD(asset.pnl)} ({formatChange(asset.pnlPercent)})
                    </span>
                  </div>
                </div>
                <div className="asset-metrics">
                  <div className="metric">
                    <span className="metric-label">Precio actual</span>
                    <span className="metric-value">{formatUSD(asset.currentPrice)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Precio prom. compra</span>
                    <span className="metric-value">{formatUSD(asset.avgBuyPrice)}</span>
                  </div>
                </div>
                <div className="asset-metrics">
                  <div className="metric">
                    <span className="metric-label">Cantidad</span>
                    <span className="metric-value">{parseFloat(asset.quantity).toFixed(asset.assetType === 'crypto' ? 6 : 2)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">24h</span>
                    <span className={`metric-value ${asset.change24h >= 0 ? 'positive' : 'negative'}`}>
                      {formatChange(asset.change24h)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedAsset && (
            <div className="asset-detail card">
              <div className="detail-header">
                <div>
                  <h3>{selectedAsset.symbol} — {selectedAsset.name}</h3>
                  <p className="page-subtitle">Historial de transacciones</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                  + Agregar
                </button>
              </div>
              {loadingTxs ? (
                <div className="loading" style={{ padding: 30 }}>Cargando...</div>
              ) : assetTxs.length === 0 ? (
                <p className="neutral" style={{ padding: '20px 0' }}>Sin transacciones</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Precio/unidad</th>
                        <th>Total</th>
                        <th>Fecha</th>
                        <th>Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assetTxs.map(tx => (
                        <tr key={tx.id}>
                          <td><span className={`badge badge-${tx.type}`}>{tx.type}</span></td>
                          <td>{parseFloat(tx.quantity).toFixed(6)}</td>
                          <td>{formatUSD(tx.price_per_unit)}</td>
                          <td>{formatUSD(tx.total_amount)}</td>
                          <td>{formatDate(tx.date)}</td>
                          <td className="neutral">{tx.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <TransactionModal
          onClose={() => setShowModal(false)}
          onSuccess={handleTransactionAdded}
          preselectedAsset={selectedAsset}
        />
      )}
    </div>
  );
}
