import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaSort, FaInbox, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { StoreBrand } from '../../domain/interfaces/IStoreBrandRepository';
import { StoreBrandRepository } from '../../infrastructure/StoreBrandRepository';
import { StoreBrandFormModal } from './modals/StoreBrandFormModal';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import { StoreBrandsTable } from './tables/StoreBrandsTable';
import { PaginatedResponse } from '../../../shared/types/PaginatedResponse';
import { OrderDirection, StoreBrandSortField } from '../../domain/types/sorting';

const storeBrandRepository = new StoreBrandRepository();

const StoreBrandPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<StoreBrandSortField>(StoreBrandSortField.NAME);
  const [sortOrder, setSortOrder] = useState<OrderDirection>(OrderDirection.ASC);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStoreBrandName, setNewStoreBrandName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal State
  const [editingStoreBrand, setEditingStoreBrand] = useState<StoreBrand | null>(null);
  const [editName, setEditName] = useState('');
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

  // Query for fetching store brands
  const { 
    data: storeBrandsResponse,
    isLoading: queryLoading 
  } = useQuery({
    queryKey: ['store-brands', searchQuery, currentPage, pageSize, sortField, sortOrder],
    queryFn: async () => {
      try {
        const data = await storeBrandRepository.getAllStoreBrands(searchQuery, currentPage, pageSize, sortField, sortOrder);
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

  const storeBrands = storeBrandsResponse?.data || [];
  const totalCount = storeBrandsResponse?.total_count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Mutation for creating store brands
  const createMutation = useMutation({
    mutationFn: (name: string) => storeBrandRepository.createStoreBrand(name),
    onSuccess: (newStoreBrand) => {
      queryClient.invalidateQueries({ queryKey: ['storeBrands'] });
      setShowAddModal(false);
      setNewStoreBrandName('');
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create store brand');
      setTimeout(() => setError(''), 3000);
    }
  });

  // Mutation for updating store brands
  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => 
      storeBrandRepository.updateStoreBrand(id, name),
    onSuccess: (updatedBrand) => {
      queryClient.invalidateQueries({ queryKey: ['storeBrands'] });
      setEditingStoreBrand(null);
      setEditName('');
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to update store brand');
      setTimeout(() => setError(''), 3000);
    }
  });

  // Mutation for deleting store brands
  const deleteMutation = useMutation({
    mutationFn: (id: number) => storeBrandRepository.deleteStoreBrand(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['storeBrands'] });
      setDeleteId(null);
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to delete store brand');
      setTimeout(() => setError(''), 3000);
    }
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newStoreBrandName);
  };

  const handleEdit = (brand: StoreBrand) => {
    setEditingStoreBrand(brand);
    setEditName(brand.name);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStoreBrand) return;
    
    updateMutation.mutate({
      id: editingStoreBrand.id,
      name: editName
    });
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
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
        <h1 className="h3 mb-0">Store Brands</h1>
        <button
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus size={14} />
          <span>Add Store Brand</span>
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
                    placeholder="Search store brands..."
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
                      {sortField === StoreBrandSortField.NAME 
                        ? `Name (${sortOrder === OrderDirection.ASC ? 'A-Z' : 'Z-A'})`
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
                          setSortField(StoreBrandSortField.NAME); 
                          setSortOrder(OrderDirection.ASC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Name (A-Z)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(StoreBrandSortField.NAME); 
                          setSortOrder(OrderDirection.DESC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Name (Z-A)
                      </button>
                      <div className="dropdown-divider my-1"></div>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(StoreBrandSortField.CREATED_AT); 
                          setSortOrder(OrderDirection.DESC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Date (Newest)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(StoreBrandSortField.CREATED_AT); 
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
                  Total Store Brands: {totalCount}
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
          <StoreBrandsTable
            storeBrands={storeBrands}
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
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {storeBrands.length === 0 && !error && (
            <div className="text-center py-5">
              <div className="text-muted mb-2">
                <FaInbox size={48} />
              </div>
              <h5 className="fw-normal text-muted">
                {searchQuery ? 'No store brands found matching your search.' : 'No store brands found'}
              </h5>
              <p className="text-muted small mb-0">Create a new store brand to get started</p>
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

      <StoreBrandFormModal
        isOpen={showAddModal}
        mode="add"
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        isProcessing={createMutation.isPending}
        name={newStoreBrandName}
        setName={setNewStoreBrandName}
      />

      <StoreBrandFormModal
        isOpen={!!editingStoreBrand}
        mode="edit"
        onClose={() => setEditingStoreBrand(null)}
        onSubmit={handleEditSubmit}
        isProcessing={updateMutation.isPending}
        name={editName}
        setName={setEditName}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        title="Delete Store Brand"
        message="Are you sure you want to delete this store brand?"
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default StoreBrandPage; 