import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
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
  const [error, setError] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newStoreBrandId, setNewStoreBrandId] = useState<number>(0);

  // Edit Modal State
  const [editingLocation, setEditingLocation] = useState<StoreLocation | null>(null);
  const [editAddress, setEditAddress] = useState('');
  const [editStoreBrandId, setEditStoreBrandId] = useState<number>(0);

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query for fetching store locations
  const { data: locations = [], isLoading: isLocationsLoading } = useQuery({
    queryKey: ['storeLocations'],
    queryFn: async () => {
      try {
        return await storeLocationRepository.getAllStoreLocations();
      } catch (err) {
        if (err instanceof Error && err.message === 'Unauthorized access. Please login again.') {
          logout();
          navigate('/');
        }
        throw err;
      }
    }
  });

  // Query for fetching store brands (needed for dropdowns)
  const { data: storeBrands = [], isLoading: isBrandsLoading } = useQuery({
    queryKey: ['storeBrands'],
    queryFn: async () => {
      try {
        return await storeBrandRepository.getAllStoreBrands();
      } catch (err) {
        if (err instanceof Error && err.message === 'Unauthorized access. Please login again.') {
          logout();
          navigate('/');
        }
        throw err;
      }
    }
  });

  // Mutation for creating store locations
  const createMutation = useMutation({
    mutationFn: ({ address, storeBrandId }: { address: string; storeBrandId: number }) =>
      storeLocationRepository.createStoreLocation(address, storeBrandId),
    onSuccess: (newLocation) => {
      queryClient.setQueryData(['storeLocations'], (old: StoreLocation[] = []) => [...old, newLocation]);
      setShowAddModal(false);
      setNewAddress('');
      setNewStoreBrandId(0);
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create store location');
    }
  });

  // Mutation for updating store locations
  const updateMutation = useMutation({
    mutationFn: ({ id, address, storeBrandId }: { id: number; address: string; storeBrandId: number }) =>
      storeLocationRepository.updateStoreLocation(id, address, storeBrandId),
    onSuccess: (updatedLocation) => {
      queryClient.setQueryData(['storeLocations'], (old: StoreLocation[] = []) =>
        old.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc)
      );
      setEditingLocation(null);
      setEditAddress('');
      setEditStoreBrandId(0);
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to update store location');
    }
  });

  // Mutation for deleting store locations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => storeLocationRepository.deleteStoreLocation(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['storeLocations'], (old: StoreLocation[] = []) =>
        old.filter(loc => loc.id !== deletedId)
      );
      setDeleteId(null);
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to delete store location');
    }
  });

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
    createMutation.mutate({ address: newAddress, storeBrandId: newStoreBrandId });
  };

  const handleEdit = (location: StoreLocation) => {
    setEditingLocation(location);
    setEditAddress(location.address);
    setEditStoreBrandId(location.store_brand.id);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    
    updateMutation.mutate({
      id: editingLocation.id,
      address: editAddress,
      storeBrandId: editStoreBrandId
    });
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  if (isLocationsLoading || isBrandsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid px-3 px-sm-4 py-4">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <h1 className="h3 mb-0">Store Locations Management</h1>
        <button
          className="btn btn-primary w-100 w-sm-auto"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Add Store Location
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <StoreLocationsTable
            locations={locations}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {locations.length === 0 && !error && (
            <div className="text-center py-4">
              <p className="text-muted mb-0">No store locations found.</p>
            </div>
          )}
        </div>
      </div>

      <StoreLocationFormModal
        isOpen={showAddModal}
        mode="add"
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        storeBrands={storeBrands}
        isProcessing={createMutation.isPending}
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
        isProcessing={updateMutation.isPending}
        address={editAddress}
        setAddress={setEditAddress}
        storeBrandId={editStoreBrandId}
        setStoreBrandId={setEditStoreBrandId}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        title="Delete Store Location"
        message="Are you sure you want to delete this store location?"
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default StoreLocationsPage; 