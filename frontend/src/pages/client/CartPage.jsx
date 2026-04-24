import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, total, itemTotal } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Veuillez saisir votre nom');
    if (items.length === 0) return setError('Votre panier est vide');

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          customer_email: form.email.trim() || null,
          items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la commande');

      clearCart();
      navigate(`/confirmation/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="text-6xl">🛒</span>
        <h2 className="text-xl font-semibold text-gray-700">Votre panier est vide</h2>
        <button onClick={() => navigate('/')} className="btn-primary">
          Retour au catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Mon panier</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liste articles */}
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => {
            const unitPrice = itemTotal(item);
            const hasPromo = item.promo > 0;
            return (
              <div key={item.id} className="card p-4 flex items-center gap-4">
                {item.photo ? (
                  <img src={item.photo} alt={item.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">🛍️</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {hasPromo ? (
                      <>
                        <span className="text-xs text-gray-400 line-through">{item.price.toFixed(2)} €</span>
                        <span className="text-sm font-bold text-red-600">{unitPrice.toFixed(2)} €</span>
                        <span className="text-xs bg-red-100 text-red-600 px-1 rounded">-{item.promo}%</span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-gray-700">{unitPrice.toFixed(2)} €</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                  >
                    +
                  </button>
                </div>
                <p className="font-bold text-gray-900 w-20 text-right">
                  {(unitPrice * item.quantity).toFixed(2)} €
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-400 hover:text-red-600 transition-colors ml-1"
                  title="Supprimer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Récapitulatif + formulaire */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Récapitulatif</h2>
            <div className="space-y-2 text-sm text-gray-600">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="truncate mr-2">{item.name} x{item.quantity}</span>
                  <span className="flex-shrink-0">{(itemTotal(item) * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between font-bold text-gray-900 text-lg">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card p-5 space-y-4">
            <h2 className="font-bold text-gray-900">Vos informations</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                className="input"
                placeholder="Votre nom"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (optionnel)</label>
              <input
                type="email"
                className="input"
                placeholder="votre@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Envoi en cours...' : 'Valider ma commande'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
