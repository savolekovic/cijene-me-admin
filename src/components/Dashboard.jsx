import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Dashboard() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default Dashboard; 