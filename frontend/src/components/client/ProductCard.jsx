import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart, items } = useCart();
  const inCart = items.find((i) => i.id === product.id);
  const isOutOfStock = product.stock_status === 'out_of_stock';
  const hasPromo = product.promo > 0;
  const finalPrice = hasPromo
    ? Math.round(product.price * (1 - product.promo / 100) * 100) / 100
    : product.price;

  return (
    <div
      className={`card flex flex-col overflow-hidden transition-transform hover:scale-[1.02] ${
        isOutOfStock ? 'opacity-60' : ''
      }`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {product.photo ? (
          <img
            src={product.photo}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
            🛍️
          </div>
        )}
        {hasPromo && !isOutOfStock && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{product.promo}%
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">{product.description}</p>
        )}

        {/* Price */}
        <div className="mt-3 flex items-end justify-between">
          <div>
            {hasPromo ? (
              <>
                <span className="text-xs text-gray-400 line-through block">
                  {product.price.toFixed(2)} €
                </span>
                <span className="text-lg font-bold text-red-600">{finalPrice.toFixed(2)} €</span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">{product.price.toFixed(2)} €</span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : inCart
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {inCart ? (
              <>+1 <span className="text-xs opacity-75">({inCart.quantity})</span></>
            ) : (
              '+ Panier'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
