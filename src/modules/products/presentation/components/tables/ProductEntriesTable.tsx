import React from 'react';
import { FaSort, FaSortDown, FaSortUp, FaStore, FaMapMarkerAlt } from 'react-icons/fa';
import { ProductEntry } from '../../../domain/interfaces/IProductEntriesRepository';
import { ProductImage } from '../../../../shared/presentation/components/ProductImage';
import { OrderDirection, ProductEntrySortField } from '../../../../shared/types/sorting';

interface ProductEntriesTableProps {
  entries: ProductEntry[];
  sortField: ProductEntrySortField;
  sortOrder: OrderDirection;
  onSort: (field: ProductEntrySortField) => void;
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
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th style={{ width: '25%', padding: '0.5rem 1rem' }}>Product</th>
                <th style={{ width: '20%', padding: '0.5rem 1rem' }}>Store Brand</th>
                <th style={{ width: '25%', padding: '0.5rem 1rem' }}>Store Location</th>
                <th 
                  onClick={() => onSort(ProductEntrySortField.PRICE)} 
                  style={{ cursor: 'pointer', width: '15%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle text-end"
                >
                  <div className="d-flex align-items-center justify-content-end">
                    <span>Price</span>
                    {getSortIcon(ProductEntrySortField.PRICE)}
                  </div>
                </th>
                <th 
                  onClick={() => onSort(ProductEntrySortField.CREATED_AT)}
                  style={{ cursor: 'pointer', width: '15%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle text-end"
                >
                  <div className="d-flex align-items-center justify-content-end">
                    <span>Created At</span>
                    {getSortIcon(ProductEntrySortField.CREATED_AT)}
                  </div>
                </th>
                <th style={{ width: '15%', padding: '0.5rem 1rem' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {entries.map((entry) => (
                <tr key={entry.id} className="border-bottom" style={{ borderColor: '#f0f0f0' }}>
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <div className="d-flex align-items-center gap-2">
                      <ProductImage 
                        imageUrl={entry.product.image_url} 
                        name={entry.product.name}
                        size="large"
                      />
                      <span>{entry.product.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.5rem 1rem' }}>{entry.store_location.store_brand.name}</td>
                  <td style={{ padding: '0.5rem 1rem' }}>{entry.store_location.address}</td>
                  <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>€{Number(entry.price).toFixed(2)}</td>
                  <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>
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
          <div key={entry.id} className="card mb-3 ms-2 me-2">
            <div className="card-body">
              <div className="d-flex align-items-start gap-3 mb-3">
                <ProductImage 
                  imageUrl={entry.product.image_url} 
                  name={entry.product.name}
                  size="small"
                />
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title mb-0">{entry.product.name}</h5>
                    <h5 className="text-primary mb-0">€{Number(entry.price).toFixed(2)}</h5>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center mb-2">
                <FaStore className="text-muted me-2" size={14} />
                <span>{entry.store_location.store_brand.name}</span>
                <FaMapMarkerAlt className="text-muted ms-3 me-2" size={14} />
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
      </div>
    </>
  );
}; 