import React, { ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider, useAuth } from './modules/auth/presentation/context/AuthContext';
import Login from './modules/auth/presentation/components/Login';
import Dashboard from './modules/shared/presentation/components/Dashboard';
import UsersPage from './modules/users/presentation/components/UsersPage';
import CategoriesPage from './modules/products/presentation/components/CategoriesPage';
import ProductsPage from './modules/products/presentation/components/ProductsPage';
import ProductEntriesPage from './modules/products/presentation/components/ProductEntriesPage';
import StoreBrandPage from './modules/stores/presentation/components/StoreBrandPage';
import StoreLocationPage from './modules/stores/presentation/components/StoreLocationPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): ReactElement => {
  const { accessToken } = useAuth();
  
  if (!accessToken) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: ProtectedRouteProps): ReactElement => {
  const { accessToken } = useAuth();
  
  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard/users" replace />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="product-entries" element={<ProductEntriesPage />} />
            <Route path="store-brands" element={<StoreBrandPage />} />
            <Route path="store-locations" element={<StoreLocationPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 