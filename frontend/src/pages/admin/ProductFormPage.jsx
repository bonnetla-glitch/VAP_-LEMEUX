import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { token } = useAuth();
  const fileRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    promo: '0',
    stock_status: 'available',
    category_id: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories);
    if (isEdit) {
      fetch(`/api/products/${id}`, { headers: authHeaders })
        .then((r) => r.json())
        .then((p) => {
          setForm({
            name: p.name || '',
            description: p.description || '',
            price: p.price?.toString() || '',
            promo: p.promo?.toString() || '0',
            stock_status: p.stock_status || 'available',
            category_id: p.category_id?.toString() || '',
          });
          if (p.photo) setPhotoPreview(p.photo);
        });
    }
  }, [id]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const finalPrice =
    form.price && parseFloat(form.price) > 0 && parseInt(form.promo) > 0
      ? (parseFloat(form.price) * (1 - parseInt(form.promo) / 100)).toFixed(2)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Le nom est requis');
    if (!form.price || parseFloat(form.price) <= 0) return setError('Le prix doit être positif');

    setLoading(true);
    setError('');

    const body = new FormData();
    body.append('name', form.name.trim());
    body.append('description', form.description);
    body.append('price', form.price);
    body.append('promo', form.promo || '0');
    body.append('stock_status', form.stock_status);
    body.append('category_id', form.category_id);
    if (photoFile) body.append('photo', photoFile);

    try {
      const url = isEdit ? `/api/products/${id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders, body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/admin/products')} className="hover:text-gray-700">
            Produits
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{isEdit ? 'Modifier' : 'Ajouter un produit'}</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-5">
              <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Informations</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Nom du produit"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    className="input"
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  >
                    <option value="">— Aucune catégorie —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="input resize-none"
                    rows={3}
                    placeholder="Description du produit..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Prix & Promotion</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promotion (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input"
                    placeholder="0"
                    value={form.promo}
                    onChange={(e) => setForm({ ...form, promo: e.target.value })}
                  />
                  {finalPrice && (
                    <p className="text-sm text-green-600 mt-1.5 font-medium">
                      Prix final : <strong>{finalPrice} €</strong>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">État du stock</label>
                  <div className="flex gap-3">
                    {['available', 'out_of_stock'].map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="stock_status"
                          value={status}
                          checked={form.stock_status === status}
                          onChange={(e) => setForm({ ...form, stock_status: e.target.value })}
                          className="text-blue-600"
                        />
                        <span className={`text-sm font-medium ${status === 'out_of_stock' ? 'text-red-600' : 'text-green-600'}`}>
                          {status === 'available' ? 'Disponible' : 'Rupture de stock'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite : photo */}
            <div>
              <div className="card p-5">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-4">Photo</h3>

                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => fileRef.current.click()}
                >
                  {photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} alt="Aperçu" className="w-full h-56 object-cover" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white font-semibold opacity-0 hover:opacity-100 bg-black/50 px-3 py-1 rounded-lg text-sm">
                          Changer la photo
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-56 flex flex-col items-center justify-center text-gray-400 gap-3">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm">Cliquer pour ajouter une photo</p>
                      <p className="text-xs">JPG, PNG, WebP — max 5 Mo</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                {photoPreview && (
                  <button
                    type="button"
                    className="mt-2 text-xs text-gray-400 hover:text-red-500 w-full text-center"
                    onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                  >
                    Supprimer la photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary px-6">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-8">
              {loading ? 'Enregistrement...' : isEdit ? 'Enregistrer les modifications' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
