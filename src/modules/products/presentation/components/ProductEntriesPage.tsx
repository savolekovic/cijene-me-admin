import React, { useEffect, useState } from 'react';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { ProductEntriesRepository } from '../../infrastructure/ProductEntriesRepository';
import { useProductEntries } from '../hooks/useProductEntries';
import { useProductEntryModals } from '../hooks/useProductEntryModals';
import { useDropdownData } from '../hooks/useDropdownData';
import { useSorting } from '../hooks/useSorting';
import { ProductEntriesTable } from './ProductEntriesTable';
import { AddProductEntryModal } from './modals/AddProductEntryModal';
import { EditProductEntryModal } from './modals/EditProductEntryModal';
import { DeleteConfirmationModal } from './modals/DeleteConfirmationModal';
import { ProductEntry } from '../../domain/interfaces/IProductEntriesRepository';

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

  const { sortField, sortOrder, handleSort, sortedEntries } = useSorting(productEntries);

  const [isLoading, setIsLoading] = useState(true);

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

  const handleAddClick = async () => {
    await fetchDropdownData();
    setShowAddModal(true);
  };

  const handleEditClick = async (entry: ProductEntry) => {
    await fetchDropdownData();
    setEditingEntry(entry);
    setEditProductId(entry.product.id);
    setEditStoreLocationId(entry.store_location.id);
    setEditPrice(entry.price.toString());
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
        <button className="btn btn-primary" onClick={handleAddClick}>
          <FaPlus className="me-2" />
          Add Product Entry
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <ProductEntriesTable
            entries={sortedEntries}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEditClick}
            onDelete={setDeleteId}
          />

          {productEntries.length === 0 && !error && (
            <div className="text-center py-4">
              <p className="text-muted">No product entries found.</p>
            </div>
          )}
        </div>
      </div>

      <AddProductEntryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateEntry}
        products={products}
        storeLocations={storeLocations}
        isLoadingDropdownData={isLoadingDropdownData}
        isCreating={isCreating}
        productId={newEntryProductId}
        setProductId={setNewEntryProductId}
        locationId={newEntryStoreLocationId}
        setLocationId={setNewEntryStoreLocationId}
        price={newEntryPrice}
        setPrice={setNewEntryPrice}
      />

      <EditProductEntryModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onSubmit={handleEditSubmit}
        products={products}
        storeLocations={storeLocations}
        isLoadingDropdownData={isLoadingDropdownData}
        isEditing={isEditing}
        editProductId={editProductId}
        setEditProductId={setEditProductId}
        editStoreLocationId={editStoreLocationId}
        setEditStoreLocationId={setEditStoreLocationId}
        editPrice={editPrice}
        setEditPrice={setEditPrice}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProductEntriesPage; 