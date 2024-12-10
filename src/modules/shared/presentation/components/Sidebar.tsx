import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaBars, 
  FaUsers, 
  FaList, 
  FaClipboardList, 
  FaBox, 
  FaStore, 
  FaMapMarkerAlt,
  FaSignOutAlt 
} from 'react-icons/fa';
import '../style/Sidebar.css';
import { useAuth } from '../../../auth/presentation/context/AuthContext';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();

  return (
    <div className={`sidebar bg-dark text-white d-flex flex-column ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="p-3 d-flex align-items-center justify-content-between">
        {!isCollapsed && <h3 className="m-0">Cijene.me</h3>}
        <button
          className="btn btn-dark burger-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <FaBars />
        </button>
      </div>
      <hr className="border-secondary mx-3 my-0" />

      <nav className="flex-grow-1">
        <NavLink to="/dashboard/users" className="sidebar-item">
          <FaUsers className="me-2" /> {!isCollapsed && 'Users'}
        </NavLink>
        <NavLink to="/dashboard/categories" className="sidebar-item">
          <FaList className="me-2" /> {!isCollapsed && 'Categories'}
        </NavLink>
        <NavLink to="/dashboard/product-entries" className="sidebar-item">
          <FaClipboardList className="me-2" /> {!isCollapsed && 'Product Entries'}
        </NavLink>
        <NavLink to="/dashboard/products" className="sidebar-item">
          <FaBox className="me-2" /> {!isCollapsed && 'Products'}
        </NavLink>
        <NavLink to="/dashboard/store-brands" className="sidebar-item">
          <FaStore className="me-2" /> {!isCollapsed && 'Store Brands'}
        </NavLink>
        <NavLink to="/dashboard/store-locations" className="sidebar-item">
          <FaMapMarkerAlt className="me-2" /> {!isCollapsed && 'Store Locations'}
        </NavLink>
      </nav>

      <div className="mt-auto">
        <hr className="border-secondary mx-3 my-0" />
        <button 
          onClick={logout}
          className="sidebar-item w-100 btn btn-link text-white text-decoration-none text-start"
        >
          <FaSignOutAlt className="me-2" /> {!isCollapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
}

export default Sidebar; 