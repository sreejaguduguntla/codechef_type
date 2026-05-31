import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/problems');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>
      <div className="auth-container animate-scaleIn">
        <div className="auth-logo">
          <span className="brand-text">Code<span style={{ color: 'var(--accent-blue)' }}>Arena</span></span>
        </div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to continue solving problems</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              id="login-email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              id="login-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={loading} id="login-btn">
            {loading ? <><div className="spinner" /> Signing in...</> : 'Sign In →'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Sign up free</Link>
        </div>

        <div className="auth-demo">
          <div className="auth-demo-label">Demo credentials</div>
          <div className="auth-demo-item">Admin: <code>admin@codejudge.io</code> / <code>admin123</code></div>
          <div className="auth-demo-item">User: <code>alice@example.com</code> / <code>password123</code></div>
        </div>
      </div>
    </div>
  );
}
