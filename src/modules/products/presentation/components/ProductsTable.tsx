import React from 'react';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
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
                    <a href={product.image_url} target="_blank" rel="noopener noreferrer">
                      View Image
                    </a>
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
              <h6 className="card-subtitle mb-2 text-muted">#{product.id}</h6>
              <h5 className="card-title">{product.name}</h5>
              <div className="mb-2">
                <strong>Barcode:</strong> {product.barcode}
              </div>
              <div className="mb-2">
                <strong>Category:</strong> {product.category?.name || 'N/A'}
              </div>
              <div className="mb-2">
                <strong>Created:</strong> {new Date(product.created_at).toLocaleDateString()}
              </div>
              <div className="mb-2">
                <a href={product.image_url} target="_blank" rel="noopener noreferrer" 
                   className="btn btn-sm btn-outline-secondary">
                  View Image
                </a>
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