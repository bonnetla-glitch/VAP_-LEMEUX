import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchProducts = useCallback(async () => {
    const res = await fetch('/api/products', { headers: authHeaders });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const toggleStock = async (product) => {
    const newStatus = product.stock_status === 'available' ? 'out_of_stock' : 'available';
    await fetch(`/api/products/${product.id}/stock`, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock_status: newStatus }),
    });
    showToast(newStatus === 'out_of_stock' ? 'Produit mis en rupture' : 'Produit disponible');
    await fetchProducts();
  };

  const deleteProduct = async (product) => {
    if (!confirm(`Supprimer "${product.name}" ?`)) return;
    await fetch(`/api/products/${product.id}`, { method: 'DELETE', headers: authHeaders });
    showToast('Produit supprimé');
    await fetchProducts();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Produits</h2>
          <button onClick={() => navigate('/admin/products/new')} className="btn-primary flex items-center gap-2">
            <span className="text-lg">+</span> Ajouter un produit
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-12">Chargement...</p>
        ) : products.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <div className="text-4xl mb-2">📦</div>
            <p className="mb-4">Aucun produit</p>
            <button onClick={() => navigate('/admin/products/new')} className="btn-primary">
              Ajouter le premier produit
            </button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Photo', 'Nom', 'Catégorie', 'Prix', 'Promo', 'Stock', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {p.photo ? (
                        <img src={p.photo} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">🛍️</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[160px]">
                      <p className="truncate">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-gray-400 truncate">{p.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category_name || '—'}</td>
                    <td className="px-4 py-3 font-semibold">{p.price.toFixed(2)} €</td>
                    <td className="px-4 py-3">
                      {p.promo > 0 ? (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                          -{p.promo}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStock(p)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          p.stock_status === 'available'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${p.stock_status === 'available' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {p.stock_status === 'available' ? 'Disponible' : 'Rupture'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteProduct(p)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-pulse">
          {toast}
        </div>
      )}
    </AdminLayout>
  );
}
