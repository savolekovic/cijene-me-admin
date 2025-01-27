import React from 'react';
import { FaSpinner } from 'react-icons/fa';

interface TableLoadingSpinnerProps {
  size?: string;
}

export const TableLoadingSpinner: React.FC<TableLoadingSpinnerProps> = ({ 
  size = '2rem' 
}) => {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <FaSpinner className="spinner-border" style={{ width: size, height: size }} />
    </div>
  );
}; 