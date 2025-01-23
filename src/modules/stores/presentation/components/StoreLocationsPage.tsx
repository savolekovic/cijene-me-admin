import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaSort, FaInbox, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { StoreBrand } from '../../domain/interfaces/IStoreBrandRepository';
import { StoreLocation } from '../../domain/interfaces/IStoreLocationRepository';
import { StoreBrandRepository } from '../../infrastructure/StoreBrandRepository';
import { StoreLocationRepository } from '../../infrastructure/StoreLocationRepository';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import { StoreLocationFormModal } from './modals/StoreLocationFormModal';
import { StoreLocationsTable } from './tables/StoreLocationsTable';

const storeLocationRepository = new StoreLocationRepository();
const storeBrandRepository = new StoreBrandRepository();

type SortField = 'address' | 'store_brand_name' | 'created_at';
type SortOrder = 'asc' | 'desc';

const StoreLocationsPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('address');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
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
      setTimeout(() => setError(''), 3000);
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
      setTimeout(() => setError(''), 3000);
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
      setTimeout(() => setError(''), 3000);
    }
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('sort-dropdown');
      const button = document.getElementById('sort-button');
      if (
        isDropdownOpen && 
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
  }, [isDropdownOpen]);

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

  const filteredLocations = locations.filter(location =>
    location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.store_brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSortedLocations = () => {
    return [...filteredLocations].sort((a, b) => {
      if (sortField === 'address') {
        return sortOrder === 'asc' 
          ? a.address.localeCompare(b.address)
          : b.address.localeCompare(a.address);
      } else if (sortField === 'store_brand_name') {
        return sortOrder === 'asc'
          ? a.store_brand.name.localeCompare(b.store_brand.name)
          : b.store_brand.name.localeCompare(a.store_brand.name);
      } else {
        return sortOrder === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  if (isLocationsLoading || isBrandsLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <FaSpinner className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-sm-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Store Locations</h1>
        <button
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus size={14} />
          <span>Add Store Location</span>
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-header border-0 bg-white py-2">
          <div className="row g-3 mb-0">
            <div className="col-12 col-sm-8 col-md-6">
              <div className="d-flex gap-2">
                <div className="input-group flex-grow-1">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search store locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch 
                    className="position-absolute text-muted" 
                    style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                    size={14}
                  />
                </div>
                <div className="position-relative">
                  <button 
                    id="sort-button"
                    className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <FaSort size={14} />
                    <span className="d-none d-sm-inline">
                      {sortField === 'address' 
                        ? `Address (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`
                        : sortField === 'store_brand_name'
                        ? `Brand (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`
                        : `Date (${sortOrder === 'asc' ? 'Oldest' : 'Newest'})`}
                    </span>
                  </button>
                  {isDropdownOpen && (
                    <div 
                      id="sort-dropdown"
                      className="position-absolute end-0 mt-1 py-1 bg-white rounded shadow-sm" 
                      style={{ 
                        zIndex: 1000, 
                        minWidth: '160px',
                        border: '1px solid rgba(0,0,0,.15)'
                      }}
                    >
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('address'); 
                          setSortOrder('asc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Address (A-Z)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('address'); 
                          setSortOrder('desc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Address (Z-A)
                      </button>
                      <div className="dropdown-divider my-1"></div>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('store_brand_name'); 
                          setSortOrder('asc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Brand (A-Z)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('store_brand_name'); 
                          setSortOrder('desc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Brand (Z-A)
                      </button>
                      <div className="dropdown-divider my-1"></div>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('created_at'); 
                          setSortOrder('desc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Date (Newest)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('created_at'); 
                          setSortOrder('asc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Date (Oldest)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-4 col-md-6">
              <div className="d-flex justify-content-start justify-content-sm-end align-items-center h-100">
                <span className="badge bg-secondary">
                  Total Store Locations: {locations.length}
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
          <StoreLocationsTable
            locations={getSortedLocations()}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={(field) => {
              if (sortField === field) {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField(field);
                setSortOrder('asc');
              }
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {locations.length === 0 && !error && (
            <div className="text-center py-5">
              <div className="text-muted mb-2">
                <FaInbox size={48} />
              </div>
              <h5 className="fw-normal text-muted">No store locations found</h5>
              <p className="text-muted small mb-0">Create a new store location to get started</p>
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