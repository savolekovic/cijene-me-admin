import React, { useEffect, useState, useMemo } from 'react';
import { FaPlus, FaSpinner, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { StoreBrandRepository } from '../../infrastructure/StoreBrandRepository';
import { StoreBrand } from '../../domain/interfaces/IStoreBrandRepository';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const storeBrandRepository = new StoreBrandRepository();

type SortField = 'id' | 'name' | 'created_at';
type SortOrder = 'asc' | 'desc';

const StoreBrandPage: React.FC = () => {
  const [storeBrands, setStoreBrands] = useState<StoreBrand[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStoreBrandName, setNewStoreBrandName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingStoreBrand, setEditingStoreBrand] = useState<StoreBrand | null>(null);
  const [editName, setEditName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoreBrands = async () => {
      try {
        const data = await storeBrandRepository.getAllStoreBrands();
        setStoreBrands(data);
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

    fetchStoreBrands();
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

  const sortedStoreBrands = useMemo(() => {
    return [...storeBrands].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
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
  }, [storeBrands, sortField, sortOrder]);

  const handleCreateStoreBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newStoreBrand = await storeBrandRepository.createStoreBrand(newStoreBrandName);
      setStoreBrands([...storeBrands, newStoreBrand]);
      setNewStoreBrandName('');
      setShowAddModal(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store brand');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (storeBrand: StoreBrand) => {
    setEditingStoreBrand(storeBrand);
    setEditName(storeBrand.name);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStoreBrand || !editName.trim()) return;

    setIsEditing(true);
    try {
      const updatedStoreBrand = await storeBrandRepository.updateStoreBrand(
        editingStoreBrand.id,
        editName.trim()
      );
      setStoreBrands(storeBrands.map(brand => 
        brand.id === updatedStoreBrand.id ? updatedStoreBrand : brand
      ));
      setEditingStoreBrand(null);
      setEditName('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update store brand');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteClick = (storeBrandId: number) => {
    setDeleteId(storeBrandId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      await storeBrandRepository.deleteStoreBrand(deleteId);
      setStoreBrands(storeBrands.filter(brand => brand.id !== deleteId));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete store brand');
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
        <h1>Store Brands Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Add Store Brand
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
                  <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                    Name {getSortIcon('name')}
                  </th>
                  <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
                    Created At {getSortIcon('created_at')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedStoreBrands.map((brand) => (
                  <tr key={brand.id}>
                    <td>{brand.id}</td>
                    <td>{brand.name}</td>
                    <td>{new Date(brand.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditClick(brand)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteClick(brand.id)}
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

          {storeBrands.length === 0 && !error && (
            <div className="text-center py-4">
              <p className="text-muted">No store brands found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Store Brand Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleCreateStoreBrand}>
                <div className="modal-header">
                  <h5 className="modal-title">Add New Store Brand</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowAddModal(false)}
                    disabled={isCreating}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="storeBrandName" className="form-label">Store Brand Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="storeBrandName"
                      value={newStoreBrandName}
                      onChange={(e) => setNewStoreBrandName(e.target.value)}
                      required
                      disabled={isCreating}
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
                    disabled={isCreating || !newStoreBrandName.trim()}
                  >
                    {isCreating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Store Brand'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Store Brand Modal */}
      {editingStoreBrand && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Store Brand</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setEditingStoreBrand(null)}
                    disabled={isEditing}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editStoreBrandName" className="form-label">Store Brand Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editStoreBrandName"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      disabled={isEditing}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEditingStoreBrand(null)}
                    disabled={isEditing}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isEditing || !editName.trim()}
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
                <p>Are you sure you want to delete this store brand?</p>
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
                    'Delete Store Brand'
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

export default StoreBrandPage; 