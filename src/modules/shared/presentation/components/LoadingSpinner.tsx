import React from 'react';
import { FaSpinner } from 'react-icons/fa';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
      <FaSpinner className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
    </div>
  );
}; 