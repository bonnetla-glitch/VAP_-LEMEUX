import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import CataloguePage from './pages/client/CataloguePage';
import CartPage from './pages/client/CartPage';
import ConfirmationPage from './pages/client/ConfirmationPage';
import LoginPage from './pages/admin/LoginPage';
import OrdersPage from './pages/admin/OrdersPage';
import ProductsPage from './pages/admin/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import ProtectedRoute from './components/admin/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CataloguePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/confirmation/:id" element={<ConfirmationPage />} />

            <Route path="/admin" element={<LoginPage />} />
            <Route
              path="/admin/orders"
              element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}
            />
            <Route
              path="/admin/products"
              element={<ProtectedRoute><ProductsPage /></ProtectedRoute>}
            />
            <Route
              path="/admin/products/new"
              element={<ProtectedRoute><ProductFormPage /></ProtectedRoute>}
            />
            <Route
              path="/admin/products/:id/edit"
              element={<ProtectedRoute><ProductFormPage /></ProtectedRoute>}
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
