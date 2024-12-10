import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { AuthProvider } from './contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard/products" replace />} />
            <Route path="users" element={<div>Users Page</div>} />
            <Route path="categories" element={<div>Categories Page</div>} />
            <Route path="products" element={<div>Products Page</div>} />
            <Route path="product-entries" element={<div>Product Entries Page</div>} />
            <Route path="store-brands" element={<div>Store Brands Page</div>} />
            <Route path="store-locations" element={<div>Store Locations Page</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 