import React from 'react';
import { Product } from '../../../domain/interfaces/IProductsRepository';
import { ProductImage } from '../../../../shared/presentation/components/ProductImage';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { OrderDirection, ProductSortField } from '../../../domain/types/sorting';

interface ProductsTableProps {
  products: Product[];
  sortField: ProductSortField;
  sortOrder: OrderDirection;
  onSort: (field: ProductSortField) => void;
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
  const getSortIcon = (field: ProductSortField) => {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />;
    return sortOrder === OrderDirection.ASC ? 
      <FaSortUp className="ms-1 text-primary" /> : 
      <FaSortDown className="ms-1 text-primary" />;
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
                <th 
                  style={{ width: '25%', padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={() => onSort(ProductSortField.NAME)}
                >
                  Name
                  {getSortIcon(ProductSortField.NAME)}
                </th>
                <th 
                  style={{ width: '20%', padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={() => onSort(ProductSortField.BARCODE)}
                >
                  Barcode
                  {getSortIcon(ProductSortField.BARCODE)}
                </th>
                <th style={{ width: '25%', padding: '0.5rem 1rem' }}>Category</th>
                <th 
                  style={{ width: '12%', padding: '0.5rem 1rem', cursor: 'pointer' }}
                  className="text-end"
                  onClick={() => onSort(ProductSortField.CREATED_AT)}
                >
                  Created At
                  {getSortIcon(ProductSortField.CREATED_AT)}
                </th>
                <th style={{ width: '10%', padding: '0.5rem 1rem' }} className="text-end">Actions</th>
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
          <div key={product.id} className="card mb-3 ms-2 me-2">
            <div className="card-body">
              <div className="d-flex gap-3">
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