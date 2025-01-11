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
  );
}; 