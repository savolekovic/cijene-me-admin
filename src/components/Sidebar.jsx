import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaBox,
  FaUsers,
  FaClipboardList,
  FaStore,
  FaMapMarkerAlt,
  FaList,
  FaSignOutAlt,
  FaBars
} from 'react-icons/fa';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    // Add logout logic here
    navigate('/');
  };

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

      <hr className="border-secondary mx-3" />
      <button
        onClick={handleLogout}
        className="sidebar-item btn btn-link text-white text-decoration-none text-start"
      >
        <FaSignOutAlt className="me-2" /> {!isCollapsed && 'Logout'}
      </button>
    </div>
  );
}

export default Sidebar; 