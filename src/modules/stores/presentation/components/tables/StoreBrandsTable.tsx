import React from 'react';
import { StoreBrand } from '../../../domain/interfaces/IStoreBrandRepository';

interface StoreBrandsTableProps {
  storeBrands: StoreBrand[];
  sortField: 'name' | 'created_at';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'name' | 'created_at') => void;
  onEdit: (brand: StoreBrand) => void;
  onDelete: (id: number) => void;
}

export const StoreBrandsTable: React.FC<StoreBrandsTableProps> = ({
  storeBrands,
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
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th 
                  onClick={() => onSort('name')} 
                  style={{ cursor: 'pointer', width: '60%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle"
                >
                  Name
                  {sortField === 'name' && (
                    <i className={`ms-1 fa fa-sort-${sortOrder}`} />
                  )}
                </th>
                <th 
                  onClick={() => onSort('created_at')} 
                  style={{ cursor: 'pointer', width: '25%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle"
                >
                  Created At
                  {sortField === 'created_at' && (
                    <i className={`ms-1 fa fa-sort-${sortOrder}`} />
                  )}
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
              {storeBrands.map((brand) => (
                <tr key={brand.id} className="border-bottom" style={{ borderColor: '#f0f0f0' }}>
                  <td style={{ padding: '0.5rem 1rem' }} className="align-middle">{brand.name}</td>
                  <td style={{ padding: '0.5rem 1rem' }} className="align-middle">
                    {new Date(brand.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.5rem 1rem' }} className="align-middle text-end">
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onEdit(brand)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(brand.id)}
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
        {storeBrands.map((brand) => (
          <div key={brand.id} className="card mb-3 ms-2 me-2">
            <div className="card-body">
              <h5 className="card-title mb-2">{brand.name}</h5>
              <div className="mb-3 text-muted small">
                <i>Added on {new Date(brand.created_at).toLocaleDateString()}</i>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary flex-grow-1"
                  onClick={() => onEdit(brand)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger flex-grow-1"
                  onClick={() => onDelete(brand.id)}
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