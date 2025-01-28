import React from 'react';
import { ProductEntry } from '../../../domain/interfaces/IProductEntriesRepository';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { OrderDirection, ProductEntrySortField } from '../../../../shared/types/sorting';

interface ProductEntriesTableProps {
  entries: ProductEntry[];
  sortField: ProductEntrySortField;
  sortOrder: OrderDirection;
  onSort: (field: ProductEntrySortField) => void;
  onEdit: (entry: ProductEntry) => void;
  onDelete: (id: number) => void;
  deletingEntries: number[];
}

export const ProductEntriesTable: React.FC<ProductEntriesTableProps> = ({
  entries,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  deletingEntries
}) => {
  const getSortIcon = (field: ProductEntrySortField) => {
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
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '40%', padding: '0.75rem 1rem' }}>Store Location</th>
                <th 
                  style={{ width: '20%', padding: '0.75rem 1rem', cursor: 'pointer' }}
                  onClick={() => onSort(ProductEntrySortField.PRICE)}
                  className="text-end"
                >
                  Price
                  {getSortIcon(ProductEntrySortField.PRICE)}
                </th>
                <th 
                  style={{ width: '25%', padding: '0.75rem 1rem', cursor: 'pointer' }}
                  onClick={() => onSort(ProductEntrySortField.CREATED_AT)}
                  className="text-end"
                >
                  Date
                  {getSortIcon(ProductEntrySortField.CREATED_AT)}
                </th>
                <th style={{ width: '15%', padding: '0.75rem 1rem' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {entries.map((entry) => (
                <tr key={entry.id} className="border-bottom" style={{ borderColor: '#f0f0f0' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div>
                      <div className="fw-medium">{entry.store_location.store_brand.name}</div>
                      <div className="text-muted small">{entry.store_location.address}</div>
                    </div>
                  </td>
                  <td className="text-end" style={{ padding: '0.75rem 1rem' }}>
                    €{Number(entry.price).toFixed(2)}
                  </td>
                  <td className="text-end" style={{ padding: '0.75rem 1rem' }}>
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-end" style={{ padding: '0.75rem 1rem' }}>
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
                        disabled={deletingEntries.includes(entry.id)}
                      >
                        {deletingEntries.includes(entry.id) ? 'Deleting...' : 'Delete'}
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
          <div key={entry.id} className="border-bottom px-3 py-2">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <div>
                <div className="fw-medium">{entry.store_location.store_brand.name}</div>
                <div className="text-muted small">{entry.store_location.address}</div>
              </div>
              <div className="text-end">
                <div className="fw-bold text-primary">€{Number(entry.price).toFixed(2)}</div>
                <div className="text-muted small">
                  {new Date(entry.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="d-flex gap-2 mt-2">
              <button
                className="btn btn-sm btn-link text-primary p-0 flex-grow-1"
                onClick={() => onEdit(entry)}
              >
                Edit
              </button>
              <div className="vr"></div>
              <button
                className="btn btn-sm btn-link text-danger p-0 flex-grow-1"
                onClick={() => onDelete(entry.id)}
                disabled={deletingEntries.includes(entry.id)}
              >
                {deletingEntries.includes(entry.id) ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}; 