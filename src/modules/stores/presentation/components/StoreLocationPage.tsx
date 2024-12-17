import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaSort, FaSortDown, FaSortUp, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { StoreBrand } from '../../domain/interfaces/IStoreBrandRepository';
import { StoreLocation } from '../../domain/interfaces/IStoreLocationRepository';
import { StoreLocationRepository } from '../../infrastructure/StoreLocationRepository';

const storeLocationRepository = new StoreLocationRepository();

type SortField = 'id' | 'address' | 'store_brand_id' | 'created_at';
type SortOrder = 'asc' | 'desc';

const StoreLocationPage: React.FC = () => {
  const [storeLocations, setStoreLocations] = useState<StoreLocation[]>([]);
  const [storeBrands] = useState<StoreBrand[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocationAddress, setNewLocationAddress] = useState('');
  const [newLocationStoreBrandId, setNewLocationStoreBrandId] = useState<number>(0);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StoreLocation | null>(null);
  const [editAddress, setEditAddress] = useState('');
  const [editStoreBrandId, setEditStoreBrandId] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsData] = await Promise.all([
          storeLocationRepository.getAllStoreLocations(),
        ]);
        setStoreLocations(locationsData);
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          logout();
          navigate('/');
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [logout, navigate]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />;
    return sortOrder === 'asc' ?
      <FaSortUp className="ms-1 text-primary" /> :
      <FaSortDown className="ms-1 text-primary" />;
  };

  const sortedLocations = useMemo(() => {
    return [...storeLocations].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'address':
          aValue = a.address;
          bValue = b.address;
          break;
        case 'store_brand_id':
          aValue = a.store_brand.id;
          bValue = b.store_brand.id;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [storeLocations, sortField, sortOrder]);

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newLocation = await storeLocationRepository.createStoreLocation(
        newLocationAddress,
        newLocationStoreBrandId
      );
      setStoreLocations([...storeLocations, newLocation]);
      setNewLocationAddress('');
      setNewLocationStoreBrandId(0);
      setShowAddModal(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store location');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (location: StoreLocation) => {
    setEditingLocation(location);
    setEditAddress(location.address);
    setEditStoreBrandId(location.store_brand.id);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;

    setIsEditing(true);
    try {
      const updatedLocation = await storeLocationRepository.updateStoreLocation(
        editingLocation.id,
        editAddress,
        editStoreBrandId
      );
      setStoreLocations(storeLocations.map(loc =>
        loc.id === updatedLocation.id ? updatedLocation : loc
      ));
      setEditingLocation(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update store location');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteClick = (locationId: number) => {
    setDeleteId(locationId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await storeLocationRepository.deleteStoreLocation(deleteId);
      setStoreLocations(storeLocations.filter(loc => loc.id !== deleteId));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete store location');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <FaSpinner className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Store Locations Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Add Store Location
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                    ID {getSortIcon('id')}
                  </th>
                  <th onClick={() => handleSort('address')} style={{ cursor: 'pointer' }}>
                    Address {getSortIcon('address')}
                  </th>
                  <th onClick={() => handleSort('store_brand_id')} style={{ cursor: 'pointer' }}>
                    Store Brand {getSortIcon('store_brand_id')}
                  </th>
                  <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
                    Created At {getSortIcon('created_at')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedLocations.map((location) => (
                  <tr key={location.id}>
                    <td>{location.id}</td>
                    <td>{location.address}</td>
                    <td>
                      {location.store_brand.name || 'Unknown Brand'}
                    </td>
                    <td>{new Date(location.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditClick(location)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteClick(location.id)}
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

          {storeLocations.length === 0 && !error && (
            <div className="text-center py-4">
              <p className="text-muted">No store locations found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Store Location Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleCreateLocation}>
                <div className="modal-header">
                  <h5 className="modal-title">Add New Store Location</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                    disabled={isCreating}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="storeBrand" className="form-label">Store Brand</label>
                    <select
                      className="form-select"
                      id="storeBrand"
                      value={newLocationStoreBrandId}
                      onChange={(e) => setNewLocationStoreBrandId(Number(e.target.value))}
                      required
                    >
                      <option value="">Select a store brand</option>
                      {storeBrands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      value={newLocationAddress}
                      onChange={(e) => setNewLocationAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isCreating || !newLocationAddress.trim() || !newLocationStoreBrandId}
                  >
                    {isCreating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Store Location'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Store Location Modal */}
      {editingLocation && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Store Location</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingLocation(null)}
                    disabled={isEditing}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editStoreBrand" className="form-label">Store Brand</label>
                    <select
                      className="form-select"
                      id="editStoreBrand"
                      value={editStoreBrandId}
                      onChange={(e) => setEditStoreBrandId(Number(e.target.value))}
                      required
                    >
                      <option value="">Select a store brand</option>
                      {storeBrands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editAddress" className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editAddress"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingLocation(null)}
                    disabled={isEditing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isEditing || !editAddress.trim() || !editStoreBrandId}
                  >
                    {isEditing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this store location?</p>
                <p className="text-muted">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Store Location'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreLocationPage; 