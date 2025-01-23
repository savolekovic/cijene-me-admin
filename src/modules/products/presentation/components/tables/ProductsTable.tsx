import React, { useState } from 'react';
import { FaSort, FaSortDown, FaSortUp, FaBox } from 'react-icons/fa';
import { Product } from '../../../domain/interfaces/IProductsRepository';

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
      { width: '60px', height: '60px', iconSize: 28 };

    return (
      <div 
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto'
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
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const dimensions = size === 'small' ? 
      { width: '50px', height: '50px' } : 
      { width: '60px', height: '60px' };
    
    const fullUrl = getFullImageUrl(imageUrl);

    if (hasError || !fullUrl) {
      return <Placeholder size={size} />;
    }

    return (
      <div style={{ 
        width: dimensions.width, 
        height: dimensions.height, 
        position: 'relative',
        margin: '0'
      }}>
        {isLoading && <Placeholder size={size} />}
        <img 
          src={fullUrl} 
          alt={name}
          style={{ 
            width: dimensions.width, 
            height: dimensions.height, 
            objectFit: 'cover',
            borderRadius: '4px',
            position: isLoading ? 'absolute' : 'static',
            top: 0,
            left: 0,
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.2s ease-in-out'
          }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
    );
  };

  return (
    <>
      {/* Desktop View */}
      <div className="d-none d-md-block">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th style={{ width: '8%', padding: '0.5rem 1rem' }}>Image</th>
                <th style={{ width: '27%', padding: '0.5rem 1rem' }}>Name</th>
                <th style={{ width: '20%', padding: '0.5rem 1rem' }}>Barcode</th>
                <th style={{ width: '25%', padding: '0.5rem 1rem' }}>Category</th>
                <th style={{ width: '10%', textAlign: 'right', padding: '0.5rem 1rem' }}>Created At</th>
                <th style={{ width: '10%', textAlign: 'right', padding: '0.5rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {products.map((product) => (
                <tr key={product.id} className="border-bottom" style={{ borderColor: '#f0f0f0' }}>
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <div style={{ width: '60px', height: '60px' }}>
                      <ProductImage 
                        imageUrl={product.image_url} 
                        name={product.name} 
                        size="large" 
                      />
                    </div>
                  </td>
                  <td style={{ padding: '0.5rem 1rem' }}>{product.name}</td>
                  <td style={{ padding: '0.5rem 1rem' }}>{product.barcode}</td>
                  <td style={{ padding: '0.5rem 1rem' }}>{product.category.name}</td>
                  <td className="text-end" style={{ padding: '0.5rem 1rem' }}>
                    {new Date(product.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-end" style={{ padding: '0.5rem 1rem' }}>
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
                <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                  <ProductImage imageUrl={product.image_url} name={product.name} size="large" />
                </div>
                <div>
                  <h5 className="card-title">{product.name}</h5>
                  <div className="text-muted small mb-2">{product.barcode}</div>
                </div>
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