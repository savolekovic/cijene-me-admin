import React, { useState } from 'react';
import { FaSort, FaSortDown, FaSortUp, FaBox } from 'react-icons/fa';
import { Product } from '../../domain/interfaces/IProductsRepository';

export type SortField = 'id' | 'name' | 'barcode' | 'category_name' | 'created_at';
type SortOrder = 'asc' | 'desc';

interface ProductsTableProps {
  products: Product[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete
}) => {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />;
    return sortOrder === 'asc' ?
      <FaSortUp className="ms-1 text-primary" /> :
      <FaSortDown className="ms-1 text-primary" />;
  };

  const getFullImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    // If the URL is already absolute (starts with http/https), use it as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Otherwise, prepend the API URL for relative paths
    if (!process.env.REACT_APP_API_URL) return null;
    return `${process.env.REACT_APP_API_URL}${imageUrl}`;
  };

  const Placeholder: React.FC<{ size: 'small' | 'large' }> = ({ size }) => {
    const dimensions = size === 'small' ? 
      { width: '50px', height: '50px', iconSize: 24 } : 
      { width: '80px', height: '80px', iconSize: 32 };

    return (
      <div 
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          backgroundColor: '#f8f9fa',
          borderRadius: size === 'small' ? '4px' : '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <FaBox size={dimensions.iconSize} className="text-muted" />
      </div>
    );
  };

  const ProductImage: React.FC<{ 
    imageUrl: string | null, 
    name: string, 
    size?: 'small' | 'large' 
  }> = ({ imageUrl, name, size = 'small' }) => {
    const [hasError, setHasError] = useState(false);
    const dimensions = size === 'small' ? 
      { width: '50px', height: '50px' } : 
      { width: '80px', height: '80px' };
    
    const fullUrl = getFullImageUrl(imageUrl);

    if (hasError || !fullUrl) {
      return <Placeholder size={size} />;
    }

    return (
      <img 
        src={fullUrl} 
        alt={name}
        style={{ 
          width: dimensions.width, 
          height: dimensions.height, 
          objectFit: 'cover',
          borderRadius: size === 'small' ? '4px' : '8px'
        }}
        onError={() => setHasError(true)}
      />
    );
  };

  return (
    <>
      {/* Desktop View */}
      <div className="d-none d-md-block">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th onClick={() => onSort('id')} style={{ cursor: 'pointer' }}>
                  ID {getSortIcon('id')}
                </th>
                <th onClick={() => onSort('name')} style={{ cursor: 'pointer' }}>
                  Name {getSortIcon('name')}
                </th>
                <th onClick={() => onSort('barcode')} style={{ cursor: 'pointer' }}>
                  Barcode {getSortIcon('barcode')}
                </th>
                <th>Image</th>
                <th onClick={() => onSort('category_name')} style={{ cursor: 'pointer' }}>
                  Category {getSortIcon('category_name')}
                </th>
                <th onClick={() => onSort('created_at')} style={{ cursor: 'pointer' }}>
                  Created At {getSortIcon('created_at')}
                </th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.barcode}</td>
                  <td>
                    <ProductImage imageUrl={product.image_url} name={product.name} size="small" />
                  </td>
                  <td>{product.category?.name || 'N/A'}</td>
                  <td>{new Date(product.created_at).toLocaleDateString()}</td>
                  <td className="text-end">
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="d-md-none">
        {products.map((product) => (
          <div key={product.id} className="card mb-3">
            <div className="card-body">
              <div className="d-flex gap-3 mb-3">
                <ProductImage imageUrl={product.image_url} name={product.name} size="large" />
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">#{product.id}</h6>
                  <h5 className="card-title">{product.name}</h5>
                </div>
              </div>
              <div className="mb-2">
                <strong>Barcode:</strong> {product.barcode}
              </div>
              <div className="mb-2">
                <strong>Category:</strong> {product.category?.name || 'N/A'}
              </div>
              <div className="mb-2">
                <strong>Created:</strong> {new Date(product.created_at).toLocaleDateString()}
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary flex-grow-1"
                  onClick={() => onEdit(product)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger flex-grow-1"
                  onClick={() => onDelete(product.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}; 