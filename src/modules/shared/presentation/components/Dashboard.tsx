import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FaUsers, FaList, FaBox, FaStore, FaMapMarkerAlt, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useAuth } from '../../../auth/presentation/context/AuthContext';

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="d-flex h-100">
      {/* Sidebar */}
      <div className={`sidebar bg-dark ${isSidebarOpen ? 'open' : ''}`} 
           style={{ 
             width: '250px', 
             minHeight: '100vh',
             position: 'fixed',
             left: isSidebarOpen ? '0' : '-250px',
             transition: 'left 0.3s ease',
             zIndex: 1030
           }}>
        <div className="d-flex flex-column p-3 text-white h-100">
          <div className="d-flex align-items-center mb-3">
            <span className="fs-4">Admin Panel</span>
            <button 
              className="btn btn-link text-white ms-auto d-md-none"
              onClick={() => setIsSidebarOpen(false)}
            >
              ×
            </button>
          </div>
          <hr />
          <ul className="nav nav-pills flex-column mb-auto">
            <li className="nav-item mb-1">
              <NavLink 
                to="users" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active-nav-link' : 'text-white'}`
                }
                onClick={handleNavClick}
              >
                <FaUsers className="me-2" />
                Users
              </NavLink>
            </li>
            <li className="nav-item mb-1">
              <NavLink 
                to="categories" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active-nav-link' : 'text-white'}`
                }
                onClick={handleNavClick}
              >
                <FaList className="me-2" />
                Categories
              </NavLink>
            </li>
            <li className="nav-item mb-1">
              <NavLink 
                to="products" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active-nav-link' : 'text-white'}`
                }
                onClick={handleNavClick}
              >
                <FaBox className="me-2" />
                Products
              </NavLink>
            </li>
            <li className="nav-item mb-1">
              <NavLink 
                to="store-brands" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active-nav-link' : 'text-white'}`
                }
                onClick={handleNavClick}
              >
                <FaStore className="me-2" />
                Store Brands
              </NavLink>
            </li>
            <li className="nav-item mb-1">
              <NavLink 
                to="store-locations" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active-nav-link' : 'text-white'}`
                }
                onClick={handleNavClick}
              >
                <FaMapMarkerAlt className="me-2" />
                Store Locations
              </NavLink>
            </li>
          </ul>
          <hr />
          <button
            className="btn btn-outline-light w-100"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="me-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow-1" style={{ 
        marginLeft: isSidebarOpen ? '250px' : '0',
        transition: 'margin-left 0.3s ease',
        width: '100%'
      }}>
        {/* Mobile toggle button */}
        <div className="d-md-none p-3">
          <button
            className="btn btn-dark"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FaBars />
          </button>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="d-md-none"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1020
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 