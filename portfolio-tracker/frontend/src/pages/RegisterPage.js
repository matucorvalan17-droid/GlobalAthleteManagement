import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './AuthPage.css';

export default function RegisterPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon-lg">◈</span>
          <h1>Portfolio Tracker</h1>
          <p>Empieza a rastrear tus inversiones hoy</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Crear Cuenta</h2>
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label>Nombre de usuario</label>
            <input
              type="text"
              className="form-control"
              placeholder="johndoe"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
          <p className="auth-link">
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
