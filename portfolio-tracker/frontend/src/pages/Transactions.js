import React, { useEffect, useState, useCallback } from 'react';
import { transactionsAPI } from '../services/api';
import { formatUSD, formatDate } from '../utils/format';
import TransactionModal from '../components/portfolio/TransactionModal';
import CSVImportModal from '../components/portfolio/CSVImportModal';
import './Transactions.css';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState({ type: '', assetType: '' });

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await transactionsAPI.getAll();
      setTransactions(data);
    } catch {
      setError('Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta transacción?')) return;
    setDeleting(id);
    try {
      await transactionsAPI.delete(id);
      setTransactions(txs => txs.filter(t => t.id !== id));
    } catch {
      alert('Error al eliminar');
    } finally {
      setDeleting(null);
    }
  }

  const filtered = transactions.filter(tx => {
    if (filter.type && tx.type !== filter.type) return false;
    if (filter.assetType && tx.asset_type !== filter.assetType) return false;
    return true;
  });

  const totalBought = transactions.filter(t => t.type === 'buy').reduce((sum, t) => sum + parseFloat(t.total_amount), 0);
  const totalSold = transactions.filter(t => t.type === 'sell').reduce((sum, t) => sum + parseFloat(t.total_amount), 0);

  if (loading) return <div className="loading">Cargando transacciones...</div>;

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1>Transacciones</h1>
          <p className="page-subtitle">Historial completo de compras y ventas</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => setShowCSVModal(true)}>
            ↑ Importar CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + Nueva Transacción
          </button>
        </div>
      </div>

      <div className="tx-stats-row">
        <div className="tx-stat card">
          <span className="stat-label">Total transacciones</span>
          <span className="stat-value" style={{ fontSize: 22 }}>{transactions.length}</span>
        </div>
        <div className="tx-stat card">
          <span className="stat-label">Total comprado</span>
          <span className="stat-value positive" style={{ fontSize: 22 }}>{formatUSD(totalBought)}</span>
        </div>
        <div className="tx-stat card">
          <span className="stat-label">Total vendido</span>
          <span className="stat-value negative" style={{ fontSize: 22 }}>{formatUSD(totalSold)}</span>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <div className="filters-row">
          <select
            className="form-control filter-select"
            value={filter.type}
            onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
          >
            <option value="">Todos los tipos</option>
            <option value="buy">Compra</option>
            <option value="sell">Venta</option>
          </select>
          <select
            className="form-control filter-select"
            value={filter.assetType}
            onChange={e => setFilter(f => ({ ...f, assetType: e.target.value }))}
          >
            <option value="">Crypto + Acciones</option>
            <option value="crypto">Solo Crypto</option>
            <option value="stock">Solo Acciones</option>
          </select>
          <span className="filter-count">{filtered.length} transacciones</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <h3>Sin transacciones</h3>
            <p>Agrega tu primera compra o importa un CSV.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Activo</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                  <th>Precio/unidad</th>
                  <th>Total</th>
                  <th>Fee</th>
                  <th>Fecha</th>
                  <th>Notas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id}>
                    <td>
                      <div className="asset-name-cell">
                        <strong>{tx.symbol}</strong>
                        <span className="asset-name-sub">{tx.name}</span>
                      </div>
                    </td>
                    <td><span className={`badge badge-${tx.type}`}>{tx.type === 'buy' ? 'Compra' : 'Venta'}</span></td>
                    <td><span className={`badge badge-${tx.asset_type}`}>{tx.asset_type}</span></td>
                    <td>{parseFloat(tx.quantity).toFixed(6)}</td>
                    <td>{formatUSD(tx.price_per_unit)}</td>
                    <td><strong>{formatUSD(tx.total_amount)}</strong></td>
                    <td className="neutral">{tx.fee > 0 ? formatUSD(tx.fee) : '—'}</td>
                    <td>{formatDate(tx.date)}</td>
                    <td className="neutral">{tx.notes || '—'}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(tx.id)}
                        disabled={deleting === tx.id}
                      >
                        {deleting === tx.id ? '...' : '×'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <TransactionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); loadTransactions(); }}
        />
      )}
      {showCSVModal && (
        <CSVImportModal
          onClose={() => setShowCSVModal(false)}
          onSuccess={() => { setShowCSVModal(false); loadTransactions(); }}
        />
      )}
    </div>
  );
}
