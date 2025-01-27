import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaSort, FaInbox, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { StoreLocation } from '../../domain/interfaces/IStoreLocationRepository';
import { StoreBrandRepository } from '../../infrastructure/StoreBrandRepository';
import { StoreLocationRepository } from '../../infrastructure/StoreLocationRepository';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import { StoreLocationFormModal } from './modals/StoreLocationFormModal';
import { StoreLocationsTable } from './tables/StoreLocationsTable';
import { PaginatedResponse } from '../../../shared/types/PaginatedResponse';
import { OrderDirection, StoreLocationSortField } from '../../domain/types/sorting';

const storeLocationRepository = new StoreLocationRepository();
const storeBrandRepository = new StoreBrandRepository();

const StoreLocationsPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<StoreLocationSortField>(StoreLocationSortField.ADDRESS);
  const [sortOrder, setSortOrder] = useState<OrderDirection>(OrderDirection.ASC);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newStoreBrandId, setNewStoreBrandId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal State
  const [editingLocation, setEditingLocation] = useState<StoreLocation | null>(null);
  const [editAddress, setEditAddress] = useState('');
  const [editStoreBrandId, setEditStoreBrandId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

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

  // Query for fetching store locations
  const { 
    data: storeLocationsResponse,
    isLoading: queryLoading 
  } = useQuery({
    queryKey: ['store-locations', searchQuery, currentPage, pageSize, sortField, sortOrder],
    queryFn: async () => {
      try {
        const data = await storeLocationRepository.getAllStoreLocations(searchQuery, currentPage, pageSize, sortField, sortOrder);
        if (!data || typeof data.total_count !== 'number' || !Array.isArray(data.data)) {
          throw new Error('Invalid data format received from server');
        }
        return data;
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          logout();
          navigate('/');
        }
        throw err;
      }
    }
  });

  const storeLocations = storeLocationsResponse?.data || [];
  const totalCount = storeLocationsResponse?.total_count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Query for fetching store brands (needed for dropdowns)
  const { data: storeBrands = [], isLoading: isBrandsLoading } = useQuery({
    queryKey: ['storeBrands', 'dropdown'],
    queryFn: async () => {
      try {
        return await storeBrandRepository.getStoreBrandsForDropdown();
      } catch (err) {
        if (err instanceof Error && err.message === 'Unauthorized access. Please login again.') {
          logout();
          navigate('/');
        }
        throw err;
      }
    },
    enabled: showAddModal || editingLocation !== null,
    staleTime: 0 // Fetch fresh data every time
  });

  // Mutation for creating store locations
  const createMutation = useMutation({
    mutationFn: ({ address, storeBrandId }: { address: string; storeBrandId: number }) =>
      storeLocationRepository.createStoreLocation(address, storeBrandId),
    onSuccess: (newLocation) => {
      queryClient.setQueryData<PaginatedResponse<StoreLocation>>(['storeLocations', searchQuery, currentPage, pageSize], (oldData) => {
        if (!oldData) return { total_count: 1, data: [newLocation] };
        return {
          ...oldData,
          total_count: oldData.total_count + 1,
          data: [...oldData.data, newLocation]
        };
      });
      setShowAddModal(false);
      setNewAddress('');
      setNewStoreBrandId(null);
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
      queryClient.setQueryData<PaginatedResponse<StoreLocation>>(['storeLocations', searchQuery, currentPage, pageSize], (oldData) => {
        if (!oldData) return { total_count: 1, data: [updatedLocation] };
        return {
          ...oldData,
          data: oldData.data.map((loc) => loc.id === updatedLocation.id ? updatedLocation : loc)
        };
      });
      setEditingLocation(null);
      setEditAddress('');
      setEditStoreBrandId(null);
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
      queryClient.setQueryData<PaginatedResponse<StoreLocation>>(['storeLocations', searchQuery, currentPage, pageSize], (oldData) => {
        if (!oldData) return { total_count: 0, data: [] };
        return {
          ...oldData,
          total_count: oldData.total_count - 1,
          data: oldData.data.filter((loc) => loc.id !== deletedId)
        };
      });
      setDeleteId(null);
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to delete store location');
      setTimeout(() => setError(''), 3000);
    }
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreBrandId) return;
    createMutation.mutate({ address: newAddress, storeBrandId: newStoreBrandId });
  };

  const handleEditClick = (location: StoreLocation) => {
    setEditingLocation(location);
    setEditAddress(location.address);
    setEditStoreBrandId(location.store_brand.id);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation || !editStoreBrandId) return;
    updateMutation.mutate({ 
      id: editingLocation.id, 
      address: editAddress, 
      storeBrandId: editStoreBrandId 
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  if (queryLoading) {
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
                      {sortField === StoreLocationSortField.ADDRESS 
                        ? `Address (${sortOrder === OrderDirection.ASC ? 'A-Z' : 'Z-A'})`
                        : sortField === StoreLocationSortField.STORE_BRAND
                        ? `Store Brand (${sortOrder === OrderDirection.ASC ? 'A-Z' : 'Z-A'})`
                        : `Date (${sortOrder === OrderDirection.ASC ? 'Oldest' : 'Newest'})`}
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
                          setSortField(StoreLocationSortField.ADDRESS); 
                          setSortOrder(OrderDirection.ASC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Address (A-Z)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(StoreLocationSortField.ADDRESS); 
                          setSortOrder(OrderDirection.DESC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Address (Z-A)
                      </button>
                      <div className="dropdown-divider my-1"></div>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(StoreLocationSortField.STORE_BRAND); 
                          setSortOrder(OrderDirection.ASC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Store Brand (A-Z)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(StoreLocationSortField.STORE_BRAND); 
                          setSortOrder(OrderDirection.DESC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Store Brand (Z-A)
                      </button>
                      <div className="dropdown-divider my-1"></div>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(StoreLocationSortField.CREATED_AT); 
                          setSortOrder(OrderDirection.DESC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Date (Newest)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(StoreLocationSortField.CREATED_AT); 
                          setSortOrder(OrderDirection.ASC);
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
              <div className="d-flex justify-content-start justify-content-sm-end align-items-center h-100 gap-2">
                <select 
                  className="form-select" 
                  style={{ width: 'auto' }}
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                </select>
                <span className="badge bg-secondary">
                  Total Store Locations: {totalCount}
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
            storeLocations={storeLocations}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={(field) => {
              if (sortField === field) {
                setSortOrder(sortOrder === OrderDirection.ASC ? OrderDirection.DESC : OrderDirection.ASC);
              } else {
                setSortField(field);
                setSortOrder(OrderDirection.ASC);
              }
            }}
            onEdit={handleEditClick}
            onDelete={setDeleteId}
          />

          {storeLocations.length === 0 && !error && (
            <div className="text-center py-5">
              <div className="text-muted mb-2">
                <FaInbox size={48} />
              </div>
              <h5 className="fw-normal text-muted">
                {searchQuery ? 'No store locations found matching your search.' : 'No store locations found'}
              </h5>
              <p className="text-muted small mb-0">Create a new store location to get started</p>
            </div>
          )}
        </div>
        <div className="card-footer bg-white border-0 py-3">
          <div className="d-flex justify-content-center align-items-center gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="mx-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <StoreLocationFormModal
        isOpen={showAddModal || !!editingLocation}
        mode={editingLocation ? 'edit' : 'add'}
        onClose={() => editingLocation ? setEditingLocation(null) : setShowAddModal(false)}
        onSubmit={editingLocation ? handleEditSubmit : handleCreateSubmit}
        storeBrands={storeBrands}
        isProcessing={editingLocation ? updateMutation.isPending : createMutation.isPending}
        address={editingLocation ? editAddress : newAddress}
        setAddress={editingLocation ? setEditAddress : setNewAddress}
        storeBrandId={editingLocation ? editStoreBrandId : newStoreBrandId}
        setStoreBrandId={editingLocation ? setEditStoreBrandId : setNewStoreBrandId}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
        title="Delete Store Location"
        message="Are you sure you want to delete this store location? This action cannot be undone."
      />
    </div>
  );
};

export default StoreLocationsPage; 