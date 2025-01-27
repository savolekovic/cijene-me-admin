import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { StoreLocation } from '../../../domain/interfaces/IStoreLocationRepository';
import { OrderDirection, StoreLocationSortField } from '../../../domain/types/sorting';

interface StoreLocationsTableProps {
  storeLocations: StoreLocation[];
  sortField: StoreLocationSortField;
  sortOrder: OrderDirection;
  onSort: (field: StoreLocationSortField) => void;
  onEdit: (location: StoreLocation) => void;
  onDelete: (id: number) => void;
}

export const StoreLocationsTable: React.FC<StoreLocationsTableProps> = ({
  storeLocations,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete
}) => {
  const getSortIcon = (field: StoreLocationSortField) => {
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
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th 
                  onClick={() => onSort(StoreLocationSortField.ADDRESS)} 
                  style={{ cursor: 'pointer', width: '45%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle"
                >
                  Address
                  {getSortIcon(StoreLocationSortField.ADDRESS)}
                </th>
                <th 
                  onClick={() => onSort(StoreLocationSortField.STORE_BRAND)} 
                  style={{ cursor: 'pointer', width: '25%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle"
                >
                  Store Brand
                  {getSortIcon(StoreLocationSortField.STORE_BRAND)}
                </th>
                <th 
                  onClick={() => onSort(StoreLocationSortField.CREATED_AT)} 
                  style={{ cursor: 'pointer', width: '15%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle"
                >
                  Created At
                  {getSortIcon(StoreLocationSortField.CREATED_AT)}
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
              {storeLocations.map((location) => (
                <tr key={location.id} className="border-bottom" style={{ borderColor: '#f0f0f0' }}>
                  <td style={{ padding: '0.5rem 1rem' }} className="align-middle">{location.address}</td>
                  <td style={{ padding: '0.5rem 1rem' }} className="align-middle">{location.store_brand.name}</td>
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
        {storeLocations.map((location) => (
          <div key={location.id} className="card mb-3 ms-2 me-2">
            <div className="card-body">
              <h5 className="card-title mb-2">{location.address}</h5>
              <div className="mb-3">
                <div className="text-muted small">Store Brand: {location.store_brand.name}</div>
                <div className="text-muted small">
                  <i>Added on {new Date(location.created_at).toLocaleDateString()}</i>
                </div>
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