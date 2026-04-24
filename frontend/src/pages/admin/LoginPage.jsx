import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuth) navigate('/admin/orders');
  }, [isAuth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connexion échouée');
      login(data.token, data.username);
      navigate('/admin/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
          <p className="text-sm text-gray-500 mt-1">VAP Lemeux — Back Office</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
            <input
              type="text"
              className="input"
              placeholder="admin"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Identifiants par défaut : admin / admin123
        </p>
      </div>
    </div>
  );
}
