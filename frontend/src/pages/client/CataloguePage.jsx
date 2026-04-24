import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/client/ProductCard';

export default function CataloguePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { count, total } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory
      ? `/api/products?category_id=${selectedCategory}`
      : '/api/products';
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); });
  }, [selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-600">VAP Lemeux</h1>
            <p className="text-xs text-gray-500">Commandez en ligne</p>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="relative flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Mon panier
            {count > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-6">
        {/* Sidebar catégories */}
        <aside className="w-52 flex-shrink-0">
          <div className="card p-4 sticky top-20">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Catégories
            </h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === null
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Tous les produits
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Grille produits */}
        <section className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Chargement...
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <span className="text-5xl mb-3">📭</span>
              <p>Aucun produit dans cette catégorie</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Barre panier flottante */}
      {count > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg font-semibold transition-colors"
          >
            <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {count}
            </span>
            Voir mon panier
            <span className="font-bold">{total.toFixed(2)} €</span>
          </button>
        </div>
      )}
    </div>
  );
}
