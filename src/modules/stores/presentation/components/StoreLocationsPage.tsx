import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { StoreBrand } from '../../domain/interfaces/IStoreBrandRepository';
import { StoreLocation } from '../../domain/interfaces/IStoreLocationRepository';
import { StoreBrandRepository } from '../../infrastructure/StoreBrandRepository';
import { StoreLocationRepository } from '../../infrastructure/StoreLocationRepository';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import { StoreLocationFormModal } from './modals/StoreLocationFormModal';
import { StoreLocationsTable } from './tables/StoreLocationsTable';
import { LoadingSpinner } from '../../../shared/presentation/components/LoadingSpinner';

const storeLocationRepository = new StoreLocationRepository();
const storeBrandRepository = new StoreBrandRepository();

type SortField = 'id' | 'address' | 'store_brand_name' | 'created_at';
type SortOrder = 'asc' | 'desc';

const StoreLocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [storeBrands, setStoreBrands] = useState<StoreBrand[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newStoreBrandId, setNewStoreBrandId] = useState<number>(0);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal State
  const [editingLocation, setEditingLocation] = useState<StoreLocation | null>(null);
  const [editAddress, setEditAddress] = useState('');
  const [editStoreBrandId, setEditStoreBrandId] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [locationsData, brandsData] = await Promise.all([
        storeLocationRepository.getAllStoreLocations(),
        storeBrandRepository.getAllStoreBrands()
      ]);
      setLocations(locationsData);
      setStoreBrands(brandsData);
      setError('');
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized access. Please login again.') {
        logout();
        navigate('/');
      } else {
        setError('Failed to load data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newLocation = await storeLocationRepository.createStoreLocation(
        newAddress,
        newStoreBrandId
      );
      setLocations(prev => [...prev, newLocation]);
      setShowAddModal(false);
      setNewAddress('');
      setNewStoreBrandId(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store location');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (location: StoreLocation) => {
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
      setLocations(prev => 
        prev.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc)
      );
      setEditingLocation(null);
      setEditAddress('');
      setEditStoreBrandId(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update store location');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      await storeLocationRepository.deleteStoreLocation(deleteId);
      setLocations(prev => prev.filter(loc => loc.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete store location');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid px-4">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Store Locations</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Add Store Location
        </button>
      </div>

      <StoreLocationsTable
        locations={locations}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <StoreLocationFormModal
        isOpen={showAddModal}
        mode="add"
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        storeBrands={storeBrands}
        isProcessing={isCreating}
        address={newAddress}
        setAddress={setNewAddress}
        storeBrandId={newStoreBrandId}
        setStoreBrandId={setNewStoreBrandId}
      />

      <StoreLocationFormModal
        isOpen={!!editingLocation}
        mode="edit"
        onClose={() => setEditingLocation(null)}
        onSubmit={handleEditSubmit}
        storeBrands={storeBrands}
        isProcessing={isEditing}
        address={editAddress}
        setAddress={setEditAddress}
        storeBrandId={editStoreBrandId}
        setStoreBrandId={setEditStoreBrandId}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        title="Delete Store Location"
        message="Are you sure you want to delete this store location?"
        isDeleting={isDeleting}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default StoreLocationsPage; 