import React from 'react';
import { FaSort, FaSortDown, FaSortUp, FaMapMarkerAlt, FaStore } from 'react-icons/fa';
import { StoreLocation } from '../../../domain/interfaces/IStoreLocationRepository';

interface StoreLocationsTableProps {
  locations: StoreLocation[];
  sortField: 'id' | 'address' | 'store_brand_name' | 'created_at';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'id' | 'address' | 'store_brand_name' | 'created_at') => void;
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
          <table className="table table-hover">
            <thead>
              <tr>
                <th onClick={() => onSort('id')} style={{ cursor: 'pointer' }}>
                  ID {getSortIcon('id')}
                </th>
                <th onClick={() => onSort('address')} style={{ cursor: 'pointer' }}>
                  Address {getSortIcon('address')}
                </th>
                <th onClick={() => onSort('store_brand_name')} style={{ cursor: 'pointer' }}>
                  Store Brand {getSortIcon('store_brand_name')}
                </th>
                <th onClick={() => onSort('created_at')} style={{ cursor: 'pointer' }}>
                  Created At {getSortIcon('created_at')}
                </th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id}>
                  <td>{location.id}</td>
                  <td>{location.address}</td>
                  <td>{location.store_brand.name}</td>
                  <td>{new Date(location.created_at).toLocaleDateString()}</td>
                  <td className="text-end">
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
          <div key={location.id} className="card mb-3 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-start gap-3 mb-3">
                <div className="bg-light rounded-circle p-2">
                  <FaMapMarkerAlt className="text-primary" size={24} />
                </div>
                <div className="flex-grow-1">
                  <h6 className="card-subtitle mb-1 text-muted">#{location.id}</h6>
                  <h5 className="card-title mb-0">{location.address}</h5>
                </div>
              </div>

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