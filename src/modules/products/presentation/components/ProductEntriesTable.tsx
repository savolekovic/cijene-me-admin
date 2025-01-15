import React from 'react';
import { FaSort, FaSortDown, FaSortUp, FaBox, FaStore, FaMapMarkerAlt } from 'react-icons/fa';
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
      </div>

      {/* Mobile View */}
      <div className="d-md-none">
        {entries.map((entry) => (
          <div key={entry.id} className="card mb-3 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-start gap-3 mb-3">
                <div className="bg-light rounded-circle p-2">
                  <FaBox className="text-primary" size={24} />
                </div>
                <div className="flex-grow-1">
                  <h6 className="card-subtitle mb-1 text-muted">#{entry.id}</h6>
                  <h5 className="card-title mb-0">{entry.product.name}</h5>
                </div>
                <div className="ms-2">
                  <h5 className="text-primary mb-0">€{entry.price.toFixed(2)}</h5>
                </div>
              </div>

              <div className="d-flex align-items-center mb-2">
                <FaStore className="text-muted me-2" size={14} />
                <span>{entry.store_location.store_brand.name}</span>
              </div>

              <div className="d-flex align-items-center mb-3">
                <FaMapMarkerAlt className="text-muted me-2" size={14} />
                <span>{entry.store_location.address}</span>
              </div>

              <div className="mb-3 text-muted small">
                <i>Added on {new Date(entry.created_at).toLocaleDateString()}</i>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary flex-grow-1"
                  onClick={() => onEdit(entry)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger flex-grow-1"
                  onClick={() => onDelete(entry.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="text-center py-4">
            <p className="text-muted mb-0">No product entries found.</p>
          </div>
        )}
      </div>
    </>
  );
}; 