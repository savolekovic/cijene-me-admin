import React from 'react';
import { FaSort, FaSortDown, FaSortUp, FaStore } from 'react-icons/fa';
import { StoreLocation } from '../../../domain/interfaces/IStoreLocationRepository';

interface StoreLocationsTableProps {
  locations: StoreLocation[];
  sortField: 'address' | 'store_brand_name' | 'created_at';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'address' | 'store_brand_name' | 'created_at') => void;
  onEdit: (location: StoreLocation) => void;
  onDelete: (id: number) => void;
}

export const StoreLocationsTable: React.FC<StoreLocationsTableProps> = ({
  locations,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete
}) => {
  const getSortIcon = (field: string) => {
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
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th 
                  onClick={() => onSort('address')} 
                  style={{ cursor: 'pointer', width: '45%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle"
                >
                  Address
                  {getSortIcon('address')}
                </th>
                <th 
                  onClick={() => onSort('store_brand_name')} 
                  style={{ cursor: 'pointer', width: '25%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle"
                >
                  Store Brand
                  {getSortIcon('store_brand_name')}
                </th>
                <th 
                  onClick={() => onSort('created_at')} 
                  style={{ cursor: 'pointer', width: '15%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle"
                >
                  Created At
                  {getSortIcon('created_at')}
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
              {locations.map((location) => (
                <tr key={location.id} className="border-bottom" style={{ borderColor: '#f0f0f0' }}>
                  <td style={{ padding: '0.5rem 1rem' }} className="align-middle">
                    {location.address}
                  </td>
                  <td style={{ padding: '0.5rem 1rem' }} className="align-middle">
                    {location.store_brand.name}
                  </td>
                  <td style={{ padding: '0.5rem 1rem' }} className="align-middle">
                    {new Date(location.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.5rem 1rem' }} className="align-middle text-end">
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onEdit(location)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(location.id)}
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
        {locations.map((location) => (
          <div key={location.id} className="card mb-3 ms-2 me-2">
            <div className="card-body">
              <h5 className="card-title mb-2">{location.address}</h5>
              <div className="d-flex align-items-center mb-2">
                <FaStore className="text-muted me-2" size={14} />
                <span>{location.store_brand.name}</span>
              </div>
              <div className="mb-3 text-muted small">
                <i>Added on {new Date(location.created_at).toLocaleDateString()}</i>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary flex-grow-1"
                  onClick={() => onEdit(location)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger flex-grow-1"
                  onClick={() => onDelete(location.id)}
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