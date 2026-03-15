import React, { useState, useEffect, useRef } from 'react';
import { transactionsAPI, pricesAPI } from '../../services/api';
import './TransactionModal.css';

const defaultForm = {
  symbol: '',
  name: '',
  assetType: 'crypto',
  type: 'buy',
  quantity: '',
  pricePerUnit: '',
  fee: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
};

export default function TransactionModal({ onClose, onSuccess, preselectedAsset }) {
  const [form, setForm] = useState({
    ...defaultForm,
    ...(preselectedAsset ? {
      symbol: preselectedAsset.symbol,
      name: preselectedAsset.name,
      assetType: preselectedAsset.assetType,
    } : {}),
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const searchTimer = useRef(null);
  const dropdownRef = useRef(null);

  const totalAmount = form.quantity && form.pricePerUnit
    ? (parseFloat(form.quantity) * parseFloat(form.pricePerUnit)).toFixed(2)
    : null;

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSymbolChange(e) {
    const value = e.target.value;
    setForm(f => ({ ...f, symbol: value }));
    if (value.length < 2) { setSearchResults([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await pricesAPI.searchAsset(value, form.assetType);
        setSearchResults(data);
        setShowDropdown(true);
      } catch {}
      setSearching(false);
    }, 400);
  }

  function selectAsset(asset) {
    setForm(f => ({ ...f, symbol: asset.symbol, name: asset.name }));
    setShowDropdown(false);
    setSearchResults([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.symbol || !form.quantity || !form.pricePerUnit) {
      return setError('Completa todos los campos requeridos');
    }
    setSubmitting(true);
    setError('');
    try {
      await transactionsAPI.create({
        ...form,
        quantity: parseFloat(form.quantity),
        pricePerUnit: parseFloat(form.pricePerUnit),
        fee: parseFloat(form.fee) || 0,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Nueva Transacción</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="tx-form">
          {error && <div className="error-msg">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de operación</label>
              <select
                className="form-control"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                <option value="buy">Compra</option>
                <option value="sell">Venta</option>
              </select>
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select
                className="form-control"
                value={form.assetType}
                onChange={e => setForm(f => ({ ...f, assetType: e.target.value, symbol: '', name: '' }))}
                disabled={!!preselectedAsset}
              >
                <option value="crypto">Criptomoneda</option>
                <option value="stock">Acción / ETF</option>
              </select>
            </div>
          </div>

          <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
            <label>Símbolo *</label>
            <input
              type="text"
              className="form-control"
              placeholder={form.assetType === 'crypto' ? 'BTC, ETH, SOL...' : 'AAPL, TSLA, AMZN...'}
              value={form.symbol}
              onChange={handleSymbolChange}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              disabled={!!preselectedAsset}
              required
            />
            {searching && <div className="search-hint">Buscando...</div>}
            {showDropdown && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map(r => (
                  <div key={r.symbol} className="search-result" onClick={() => selectAsset(r)}>
                    <strong>{r.symbol}</strong>
                    <span>{r.name}</span>
                    {r.exchange && <span className="result-exchange">{r.exchange}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Nombre del activo</label>
            <input
              type="text"
              className="form-control"
              placeholder="Bitcoin, Apple Inc..."
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cantidad *</label>
              <input
                type="number"
                className="form-control"
                placeholder="0.00"
                step="any"
                min="0"
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Precio por unidad (USD) *</label>
              <input
                type="number"
                className="form-control"
                placeholder="0.00"
                step="any"
                min="0"
                value={form.pricePerUnit}
                onChange={e => setForm(f => ({ ...f, pricePerUnit: e.target.value }))}
                required
              />
            </div>
          </div>

          {totalAmount && (
            <div className="tx-total">
              Total: <strong>${totalAmount}</strong>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Fee / Comisión (USD)</label>
              <input
                type="number"
                className="form-control"
                placeholder="0.00"
                step="any"
                min="0"
                value={form.fee}
                onChange={e => setForm(f => ({ ...f, fee: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Fecha *</label>
              <input
                type="date"
                className="form-control"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notas (opcional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: compra en Binance"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar Transacción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
