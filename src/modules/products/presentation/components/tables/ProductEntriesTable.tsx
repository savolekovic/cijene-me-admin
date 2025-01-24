import React from 'react';
import { FaSort, FaSortDown, FaSortUp, FaStore, FaMapMarkerAlt } from 'react-icons/fa';
import { ProductEntry } from '../../../domain/interfaces/IProductEntriesRepository';
import { ProductEntrySortField, SortOrder } from '../../../domain/types/sorting';
import { ProductImage } from '../../../../shared/presentation/components/ProductImage';

interface ProductEntriesTableProps {
  entries: ProductEntry[];
  sortField: ProductEntrySortField;
  sortOrder: SortOrder;
  onSort: (field: ProductEntrySortField) => void;
  onEdit: (entry: ProductEntry) => void;
  onDelete: (id: number) => void;
}

const getSortIcon = (currentField: ProductEntrySortField, sortField: ProductEntrySortField, sortOrder: SortOrder) => {
  if (currentField !== sortField) return <FaSort className="ms-1 text-muted" />;
  return sortOrder === 'asc' ? 
    <FaSortUp className="ms-1 text-primary" /> : 
    <FaSortDown className="ms-1 text-primary" />;
};

export const ProductEntriesTable: React.FC<ProductEntriesTableProps> = ({
  entries,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete
}) => {
  return (
    <>
      {/* Desktop View */}
      <div className="d-none d-md-block">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th 
                  onClick={() => onSort('product_name')} 
                  style={{ cursor: 'pointer', width: '25%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle"
                >
                  <div className="d-flex align-items-center">
                    <span>Product</span>
                    {getSortIcon('product_name', sortField, sortOrder)}
                  </div>
                </th>
                <th 
                  onClick={() => onSort('store_brand_name')} 
                  style={{ cursor: 'pointer', width: '20%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle"
                >
                  <div className="d-flex align-items-center">
                    <span>Store Brand</span>
                    {getSortIcon('store_brand_name', sortField, sortOrder)}
                  </div>
                </th>
                <th 
                  onClick={() => onSort('store_address')} 
                  style={{ cursor: 'pointer', width: '25%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle"
                >
                  <div className="d-flex align-items-center">
                    <span>Store Location</span>
                    {getSortIcon('store_address', sortField, sortOrder)}
                  </div>
                </th>
                <th 
                  onClick={() => onSort('price')} 
                  style={{ cursor: 'pointer', width: '15%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle text-end"
                >
                  <div className="d-flex align-items-center justify-content-end">
                    <span>Price</span>
                    {getSortIcon('price', sortField, sortOrder)}
                  </div>
                </th>
                <th 
                  style={{ width: '15%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle text-end"
                >
                  Actions
                </th>
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