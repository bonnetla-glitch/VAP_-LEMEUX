import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin/orders', label: 'Commandes', icon: '📦' },
  { to: '/admin/products', label: 'Produits', icon: '🛍️' },
];

export default function AdminLayout({ children, pendingCount = 0 }) {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 text-white flex flex-col">
        <div className="p-5 border-b border-slate-700">
          <h1 className="text-lg font-bold text-white">VAP Lemeux</h1>
          <p className="text-xs text-slate-400 mt-0.5">Back Office</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span>{icon}</span>
              <span>{label}</span>
              {label === 'Commandes' && pendingCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Connecté : {username}</p>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors text-left"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
