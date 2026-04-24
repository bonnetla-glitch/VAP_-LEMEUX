import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

const STATUS_LABELS = {
  pending: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-800' },
  validated: { label: 'Validée', cls: 'bg-green-100 text-green-800' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchOrders = useCallback(async () => {
    const url = filter === 'all' ? '/api/orders' : `/api/orders?status=${filter}`;
    const res = await fetch(url, { headers: authHeaders });
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filter, token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openDetail = async (id) => {
    setSelected(id);
    const res = await fetch(`/api/orders/${id}`, { headers: authHeaders });
    const data = await res.json();
    setDetail(data);
  };

  const validate = async (id) => {
    await fetch(`/api/orders/${id}/validate`, { method: 'PUT', headers: authHeaders });
    await fetchOrders();
    if (detail && detail.id === id) setDetail({ ...detail, status: 'validated' });
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <AdminLayout pendingCount={pendingCount}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Commandes</h2>
          <div className="flex gap-2">
            {['all', 'pending', 'validated'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s === 'all' ? 'Toutes' : s === 'pending' ? 'En attente' : 'Validées'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-12">Chargement...</p>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p>Aucune commande</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['N°', 'Client', 'Email', 'Date', 'Total', 'Statut', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const s = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-semibold text-gray-700">
                        #{String(order.id).padStart(4, '0')}
                      </td>
                      <td className="px-4 py-3 font-medium">{order.customer_name}</td>
                      <td className="px-4 py-3 text-gray-500">{order.customer_email || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 font-bold">{order.total.toFixed(2)} €</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetail(order.id)}
                            className="text-xs text-blue-600 hover:underline font-medium"
                          >
                            Détail
                          </button>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => validate(order.id)}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-semibold transition-colors"
                            >
                              Valider
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal détail */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { setSelected(null); setDetail(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {!detail ? (
              <p className="text-center text-gray-400 py-6">Chargement...</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-900">
                    Commande #{String(detail.id).padStart(4, '0')}
                  </h3>
                  <button
                    onClick={() => { setSelected(null); setDetail(null); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-sm text-gray-600 mb-4 space-y-1">
                  <p><span className="font-medium">Client :</span> {detail.customer_name}</p>
                  {detail.customer_email && <p><span className="font-medium">Email :</span> {detail.customer_email}</p>}
                  <p><span className="font-medium">Statut :</span>{' '}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_LABELS[detail.status]?.cls}`}>
                      {STATUS_LABELS[detail.status]?.label}
                    </span>
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  {(detail.items || []).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product_name} <span className="text-gray-400">x{item.quantity}</span></span>
                      <span className="font-semibold">{(item.unit_price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>{detail.total.toFixed(2)} €</span>
                </div>
                {detail.status === 'pending' && (
                  <button
                    onClick={() => validate(detail.id)}
                    className="btn-success w-full mt-4 py-2.5"
                  >
                    Valider la commande
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
