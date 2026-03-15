import React, { useState, useRef } from 'react';
import { transactionsAPI } from '../../services/api';
import './CSVImportModal.css';

const CSV_TEMPLATE = `symbol,name,asset_type,type,quantity,price_per_unit,fee,date,notes
BTC,Bitcoin,crypto,buy,0.5,45000,10,2024-01-15,Compra en Binance
ETH,Ethereum,crypto,buy,2,2500,5,2024-02-01,
AAPL,Apple Inc.,stock,buy,10,180.5,1,2024-01-20,Compra en broker`;

export default function CSVImportModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (f && !f.name.endsWith('.csv')) {
      setError('Solo se aceptan archivos .csv');
      return;
    }
    setFile(f);
    setError('');
    setResult(null);
  }

  async function handleImport() {
    if (!file) return setError('Selecciona un archivo CSV');
    setLoading(true);
    setError('');
    try {
      const { data } = await transactionsAPI.importCSV(file);
      setResult(data);
      if (data.imported > 0) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al importar');
    } finally {
      setLoading(false);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Importar CSV</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="csv-content">
          <div className="csv-info">
            <p>El CSV debe tener estas columnas:</p>
            <div className="columns-list">
              <code>symbol</code> <code>name</code> <code>asset_type</code> <code>type</code>
              <code>quantity</code> <code>price_per_unit</code> <code>fee</code> <code>date</code> <code>notes</code>
            </div>
            <p className="hint">
              <strong>asset_type:</strong> <code>crypto</code> o <code>stock</code> &nbsp;|&nbsp;
              <strong>type:</strong> <code>buy</code> o <code>sell</code> &nbsp;|&nbsp;
              <strong>date:</strong> formato <code>YYYY-MM-DD</code>
            </p>
            <button className="btn btn-ghost btn-sm" onClick={downloadTemplate}>
              ↓ Descargar plantilla
            </button>
          </div>

          {error && <div className="error-msg">{error}</div>}

          {result && (
            <div className={result.imported > 0 ? 'success-msg' : 'error-msg'}>
              {result.imported > 0 && <div>✓ {result.imported} transacciones importadas exitosamente</div>}
              {result.errors?.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}

          <div
            className={`drop-zone ${file ? 'has-file' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
          >
            <input ref={inputRef} type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />
            {file ? (
              <div className="file-info">
                <span className="file-icon">📄</span>
                <span>{file.name}</span>
                <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <div className="drop-hint">
                <span>Arrastra tu CSV aquí o</span>
                <span className="drop-link">selecciona un archivo</span>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleImport} disabled={!file || loading}>
              {loading ? 'Importando...' : 'Importar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
