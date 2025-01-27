import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { StoreLocation } from '../../../domain/interfaces/IStoreLocationRepository';
import { OrderDirection, StoreLocationSortField } from '../../../../shared/types/sorting';

interface StoreLocationsTableProps {
  storeLocations: StoreLocation[];
  sortField: StoreLocationSortField;
  sortOrder: OrderDirection;
  onSort: (field: StoreLocationSortField) => void;
  onEdit: (location: StoreLocation) => void;
  onDelete: (id: number) => void;
  deletingLocations: number[];
}

export const StoreLocationsTable: React.FC<StoreLocationsTableProps> = ({
  storeLocations,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  deletingLocations
}) => {
  const getSortIcon = (field: StoreLocationSortField) => {
    if (field !== sortField) return <FaSort />;
    return sortOrder === OrderDirection.ASC ? <FaSortUp /> : <FaSortDown />;
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
                  className="border-0 px-3" 
                  style={{ cursor: 'pointer', minWidth: '200px' }}
                  onClick={() => onSort(StoreLocationSortField.ADDRESS)}
                >
                  <div className="d-flex align-items-center gap-2">
                    Address
                    {getSortIcon(StoreLocationSortField.ADDRESS)}
                  </div>
                </th>
                <th 
                  className="border-0 px-3" 
                  style={{ cursor: 'pointer', minWidth: '200px' }}
                  onClick={() => onSort(StoreLocationSortField.STORE_BRAND)}
                >
                  <div className="d-flex align-items-center gap-2">
                    Store Brand
                    {getSortIcon(StoreLocationSortField.STORE_BRAND)}
                  </div>
                </th>
                <th 
                  className="border-0 px-3" 
                  style={{ cursor: 'pointer', minWidth: '200px' }}
                  onClick={() => onSort(StoreLocationSortField.CREATED_AT)}
                >
                  <div className="d-flex align-items-center gap-2">
                    Created At
                    {getSortIcon(StoreLocationSortField.CREATED_AT)}
                  </div>
                </th>
                <th className="border-0 px-3 text-end" style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {storeLocations.map((location) => (
                <tr key={location.id}>
                  <td className="px-3">{location.address}</td>
                  <td className="px-3">{location.store_brand.name}</td>
                  <td className="px-3">{new Date(location.created_at).toLocaleDateString()}</td>
                  <td className="px-3 text-end">
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
                        disabled={deletingLocations.includes(location.id)}
                      >
                        {deletingLocations.includes(location.id) ? 'Deleting...' : 'Delete'}
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