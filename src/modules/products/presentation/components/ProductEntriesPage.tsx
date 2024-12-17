import React, { useEffect, useState, useMemo } from 'react';
import { FaPlus, FaSpinner, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { ProductEntriesRepository } from '../../infrastructure/ProductEntriesRepository';
import { ProductsRepository } from '../../infrastructure/ProductsRepository';
import { StoreLocationRepository } from '../../../stores/infrastructure/StoreLocationRepository';
import { ProductEntry } from '../../domain/interfaces/IProductEntriesRepository';
import { Product } from '../../domain/interfaces/IProductsRepository';
import { StoreLocation } from '../../../stores/domain/interfaces/IStoreLocationRepository';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const productEntriesRepository = new ProductEntriesRepository();
const productsRepository = new ProductsRepository();
const storeLocationRepository = new StoreLocationRepository();

type SortField = 'id' | 'product_name' | 'store_address' | 'store_brand_name' | 'price' | 'created_at';
type SortOrder = 'asc' | 'desc';

const ProductEntriesPage: React.FC = () => {
  const [productEntries, setProductEntries] = useState<ProductEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeLocations, setStoreLocations] = useState<StoreLocation[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntryProductId, setNewEntryProductId] = useState<number>(0);
  const [newEntryStoreLocationId, setNewEntryStoreLocationId] = useState<number>(0);
  const [newEntryPrice, setNewEntryPrice] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProductEntry | null>(null);
  const [editProductId, setEditProductId] = useState<number>(0);
  const [editStoreLocationId, setEditStoreLocationId] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entriesData, productsData, locationsData] = await Promise.all([
          productEntriesRepository.getAllProductEntries(),
          productsRepository.getAllProducts(),
          storeLocationRepository.getAllStoreLocations()
        ]);
        setProductEntries(entriesData);
        setProducts(productsData);
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

  const sortedEntries = useMemo(() => {
    return [...productEntries].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      // Safely get values based on sort field
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'product_name':
          aValue = a.product_name || '';
          bValue = b.product_name || '';
          break;
        case 'store_address':
          aValue = a.store_address || '';
          bValue = b.store_address || '';
          break;
        case 'store_brand_name':
          aValue = a.store_brand_name || '';
          bValue = b.store_brand_name || '';
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          aValue = '';
          bValue = '';
      }

      // Convert strings to lowercase for string comparison
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
  }, [productEntries, sortField, sortOrder]);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newEntry = await productEntriesRepository.createProductEntry(
        newEntryProductId,
        newEntryStoreLocationId,
        Number(newEntryPrice)
      );
      setProductEntries([...productEntries, newEntry]);
      setNewEntryProductId(0);
      setNewEntryStoreLocationId(0);
      setNewEntryPrice('');
      setShowAddModal(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product entry');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (entry: ProductEntry) => {
    setEditingEntry(entry);
    setEditProductId(entry.product_id);
    setEditStoreLocationId(entry.store_location_id);
    setEditPrice(entry.price.toString());
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    setIsEditing(true);
    try {
      const updatedEntry = await productEntriesRepository.updateProductEntry(
        editingEntry.id,
        editProductId,
        editStoreLocationId,
        Number(editPrice)
      );
      setProductEntries(productEntries.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      ));
      setEditingEntry(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product entry');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteClick = (entryId: number) => {
    setDeleteId(entryId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      await productEntriesRepository.deleteProductEntry(deleteId);
      setProductEntries(productEntries.filter(entry => entry.id !== deleteId));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product entry');
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
        <h1>Product Entries Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Add Product Entry
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
                  <th onClick={() => handleSort('product_name')} style={{ cursor: 'pointer' }}>
                    Product {getSortIcon('product_name')}
                  </th>
                  <th onClick={() => handleSort('store_address')} style={{ cursor: 'pointer' }}>
                    Store Location {getSortIcon('store_address')}
                  </th>
                  <th onClick={() => handleSort('store_brand_name')} style={{ cursor: 'pointer' }}>
                    Store Brand {getSortIcon('store_brand_name')}
                  </th>
                  <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                    Price {getSortIcon('price')}
                  </th>
                  <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
                    Created At {getSortIcon('created_at')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.id}</td>
                    <td>{entry.product_name || products.find(p => p.id === entry.product_id)?.name}</td>
                    <td>{entry.store_address || storeLocations.find(l => l.id === entry.store_location_id)?.address}</td>
                    <td>{entry.store_brand_name}</td>
                    <td>€{entry.price.toFixed(2)}</td>
                    <td>{new Date(entry.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditClick(entry)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteClick(entry.id)}
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

          {productEntries.length === 0 && !error && (
            <div className="text-center py-4">
              <p className="text-muted">No product entries found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Entry Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleCreateEntry}>
                <div className="modal-header">
                  <h5 className="modal-title">Add New Product Entry</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowAddModal(false)}
                    disabled={isCreating}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="product" className="form-label">Product</label>
                    <select
                      className="form-select"
                      id="product"
                      value={newEntryProductId}
                      onChange={(e) => setNewEntryProductId(Number(e.target.value))}
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="storeLocation" className="form-label">Store Location</label>
                    <select
                      className="form-select"
                      id="storeLocation"
                      value={newEntryStoreLocationId}
                      onChange={(e) => setNewEntryStoreLocationId(Number(e.target.value))}
                      required
                    >
                      <option value="">Select a store location</option>
                      {storeLocations.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.address}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="price" className="form-label">Price (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      id="price"
                      value={newEntryPrice}
                      onChange={(e) => setNewEntryPrice(e.target.value)}
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
                    disabled={isCreating || !newEntryProductId || !newEntryStoreLocationId || !newEntryPrice}
                  >
                    {isCreating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Product Entry'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Entry Modal */}
      {editingEntry && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Product Entry</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setEditingEntry(null)}
                    disabled={isEditing}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editProduct" className="form-label">Product</label>
                    <select
                      className="form-select"
                      id="editProduct"
                      value={editProductId}
                      onChange={(e) => setEditProductId(Number(e.target.value))}
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editStoreLocation" className="form-label">Store Location</label>
                    <select
                      className="form-select"
                      id="editStoreLocation"
                      value={editStoreLocationId}
                      onChange={(e) => setEditStoreLocationId(Number(e.target.value))}
                      required
                    >
                      <option value="">Select a store location</option>
                      {storeLocations.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.address}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editPrice" className="form-label">Price (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      id="editPrice"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEditingEntry(null)}
                    disabled={isEditing}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isEditing || !editProductId || !editStoreLocationId || !editPrice}
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
                <p>Are you sure you want to delete this product entry?</p>
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
                    'Delete Product Entry'
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

export default ProductEntriesPage; 