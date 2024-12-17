import React from 'react';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { ProductEntry } from '../../domain/interfaces/IProductEntriesRepository';
import { SortField, SortOrder } from '../utils/sorting';

interface ProductEntriesTableProps {
  entries: ProductEntry[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onEdit: (entry: ProductEntry) => void;
  onDelete: (id: number) => void;
}

export const ProductEntriesTable: React.FC<ProductEntriesTableProps> = ({
  entries,
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
            <th onClick={() => onSort('product_name')} style={{ cursor: 'pointer' }}>
              Product {getSortIcon('product_name')}
            </th>
            <th onClick={() => onSort('store_address')} style={{ cursor: 'pointer' }}>
              Store Location {getSortIcon('store_address')}
            </th>
            <th onClick={() => onSort('store_brand_name')} style={{ cursor: 'pointer' }}>
              Store Brand {getSortIcon('store_brand_name')}
            </th>
            <th onClick={() => onSort('price')} style={{ cursor: 'pointer' }}>
              Price {getSortIcon('price')}
            </th>
            <th onClick={() => onSort('created_at')} style={{ cursor: 'pointer' }}>
              Created At {getSortIcon('created_at')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.id}</td>
              <td>{entry.product.name}</td>
              <td>{entry.store_location.address}</td>
              <td>{entry.store_location.store_brand.name}</td>
              <td>€{entry.price.toFixed(2)}</td>
              <td>{new Date(entry.created_at).toLocaleDateString()}</td>
              <td>
                <div className="btn-group">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onEdit(entry)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(entry.id)}
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