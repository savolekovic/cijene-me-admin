import React, { useEffect, useState } from 'react';
import { FaPlus, FaInbox, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { LoadingSpinner } from '../../../shared/presentation/components/LoadingSpinner';
import { ProductEntry } from '../../domain/interfaces/IProductEntriesRepository';
import { ProductEntriesRepository } from '../../infrastructure/ProductEntriesRepository';
import { useDropdownData } from '../hooks/useDropdownData';
import { useProductEntries } from '../hooks/useProductEntries';
import { useProductEntryModals } from '../hooks/useProductEntryModals';
import { useSorting } from '../hooks/useSorting';
import { SortField } from '../utils/sorting';
import { ProductEntriesTable } from './ProductEntriesTable';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import { ProductEntryFormModal } from './modals/ProductEntryFormModal';

const productEntriesRepository = new ProductEntriesRepository();

const ProductEntriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { 
    productEntries, 
    setProductEntries, 
    isDeleting, 
    error, 
    setError,
    handleDeleteEntry 
  } = useProductEntries();

  const {
    products,
    storeLocations,
    isLoading: isLoadingDropdownData,
    fetchData: fetchDropdownData
  } = useDropdownData();

  const {
    showAddModal,
    setShowAddModal,
    isCreating,
    setIsCreating,
    newEntryProductId,
    setNewEntryProductId,
    newEntryStoreLocationId,
    setNewEntryStoreLocationId,
    newEntryPrice,
    setNewEntryPrice,
    resetAddForm,
    editingEntry,
    setEditingEntry,
    isEditing,
    setIsEditing,
    editProductId,
    setEditProductId,
    editStoreLocationId,
    setEditStoreLocationId,
    editPrice,
    setEditPrice,
    resetEditForm,
    deleteId,
    setDeleteId
  } = useProductEntryModals();

  const { sortField, sortOrder, handleSort } = useSorting(productEntries);

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const entriesData = await productEntriesRepository.getAllProductEntries();
        setProductEntries(entriesData);
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

    fetchEntries();
  }, [logout, navigate, setProductEntries, setError]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('sortDropdown');
      const button = document.getElementById('sortButton');
      if (
        dropdown &&
        button &&
        !dropdown.contains(event.target as Node) &&
        !button.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />;
    return sortOrder === 'asc' ?
      <FaSortUp className="ms-1 text-primary" /> :
      <FaSortDown className="ms-1 text-primary" />;
  };

  const filteredEntries = productEntries.filter(entry =>
    entry.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.store_location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.store_location.store_brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedAndFilteredEntries = [...filteredEntries].sort((a, b) => {
    switch (sortField) {
      case 'product_name':
        return a.product.name.localeCompare(b.product.name);
      case 'store_brand_name':
        return a.store_location.store_brand.name.localeCompare(b.store_location.store_brand.name);
      case 'store_address':
        return a.store_location.address.localeCompare(b.store_location.address);
      case 'price':
        return a.price - b.price;
      case 'created_at':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      default:
        return 0;
    }
  });

  if (sortOrder === 'desc') {
    sortedAndFilteredEntries.reverse();
  }

  const handleAddClick = () => {
    setShowAddModal(true);
    fetchDropdownData();
  };

  const handleEditClick = (entry: ProductEntry) => {
    setEditingEntry(entry);
    setEditProductId(entry.product.id);
    setEditStoreLocationId(entry.store_location.id);
    setEditPrice(entry.price.toString());
    fetchDropdownData();
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newEntry = await productEntriesRepository.createProductEntry(
        Number(newEntryProductId),
        Number(newEntryStoreLocationId),
        Number(newEntryPrice)
      );
      setProductEntries(prevEntries => [...prevEntries, newEntry]);
      resetAddForm();
      setShowAddModal(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product entry');
    } finally {
      setIsCreating(false);
    }
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
      resetEditForm();
      setEditingEntry(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product entry');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await handleDeleteEntry(deleteId);
    setDeleteId(null);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid px-3 px-sm-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Product Entries</h1>
        <button 
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={handleAddClick}
        >
          <FaPlus size={14} />
          <span>Add Entry</span>
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-header border-0 bg-white py-2">
          <div className="row g-3 mb-0">
            <div className="col-12 col-sm-8 col-md-6">
              <div className="d-flex gap-2">
                <div className="flex-grow-1 position-relative">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch 
                    className="position-absolute text-muted" 
                    style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                    size={14}
                  />
                </div>
                <div className="dropdown">
                  <button
                    id="sortButton"
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <FaSort size={14} />
                    <span>Sort</span>
                  </button>
                  <div 
                    id="sortDropdown"
                    className={`dropdown-menu dropdown-menu-end shadow-sm ${isDropdownOpen ? 'show' : ''}`}
                    style={{ minWidth: '200px' }}
                  >
                    <button 
                      className="dropdown-item d-flex justify-content-between align-items-center"
                      onClick={() => { handleSort('product_name'); setIsDropdownOpen(false); }}
                    >
                      <span>Product Name</span>
                      {getSortIcon('product_name')}
                    </button>
                    <button 
                      className="dropdown-item d-flex justify-content-between align-items-center"
                      onClick={() => { handleSort('store_brand_name'); setIsDropdownOpen(false); }}
                    >
                      <span>Store Brand</span>
                      {getSortIcon('store_brand_name')}
                    </button>
                    <button 
                      className="dropdown-item d-flex justify-content-between align-items-center"
                      onClick={() => { handleSort('store_address'); setIsDropdownOpen(false); }}
                    >
                      <span>Store Location</span>
                      {getSortIcon('store_address')}
                    </button>
                    <button 
                      className="dropdown-item d-flex justify-content-between align-items-center"
                      onClick={() => { handleSort('price'); setIsDropdownOpen(false); }}
                    >
                      <span>Price</span>
                      {getSortIcon('price')}
                    </button>
                    <button 
                      className="dropdown-item d-flex justify-content-between align-items-center"
                      onClick={() => { handleSort('created_at'); setIsDropdownOpen(false); }}
                    >
                      <span>Date</span>
                      {getSortIcon('created_at')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-4 col-md-6">
              <div className="d-flex justify-content-start justify-content-sm-end align-items-center h-100">
                <span className="badge bg-secondary">
                  Total Entries: {filteredEntries.length}
                </span>
              </div>
            </div>
          </div>
          {error && (
            <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')} />
            </div>
          )}
        </div>
        <div className="card-body p-0">
          <ProductEntriesTable
            entries={sortedAndFilteredEntries}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEditClick}
            onDelete={setDeleteId}
          />

          {filteredEntries.length === 0 && !error && (
            <div className="text-center py-5">
              <div className="text-muted mb-2">
                <FaInbox size={48} />
              </div>
              <h5 className="fw-normal text-muted">
                {searchQuery ? 'No matching entries found' : 'No entries found'}
              </h5>
              <p className="text-muted small mb-0">
                {searchQuery ? 'Try adjusting your search' : 'Create a new entry to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      <ProductEntryFormModal
        isOpen={showAddModal || !!editingEntry}
        onClose={() => editingEntry ? setEditingEntry(null) : setShowAddModal(false)}
        onSubmit={editingEntry ? handleEditSubmit : handleCreateEntry}
        products={products}
        storeLocations={storeLocations}
        isLoadingDropdownData={isLoadingDropdownData}
        isProcessing={editingEntry ? isEditing : isCreating}
        productId={editingEntry ? editProductId : newEntryProductId}
        setProductId={editingEntry ? setEditProductId : setNewEntryProductId}
        locationId={editingEntry ? editStoreLocationId : newEntryStoreLocationId}
        setLocationId={editingEntry ? setEditStoreLocationId : setNewEntryStoreLocationId}
        price={editingEntry ? editPrice : newEntryPrice}
        setPrice={editingEntry ? setEditPrice : setNewEntryPrice}
        mode={editingEntry ? 'edit' : 'add'}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        title="Delete Product Entry"
        message="Are you sure you want to delete this product entry?"
        isDeleting={isDeleting}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ProductEntriesPage; 