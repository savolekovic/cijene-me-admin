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

const storeBrandRepository = new StoreBrandRepository();

type SortField = 'name' | 'created_at';
type SortOrder = 'asc' | 'desc';

const StoreBrandPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStoreBrandName, setNewStoreBrandName] = useState('');

  // Edit Modal State
  const [editingStoreBrand, setEditingStoreBrand] = useState<StoreBrand | null>(null);
  const [editName, setEditName] = useState('');

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Reset to first page when search query or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  // Query for fetching store brands
  const { 
    data: storeBrandsResponse,
    isLoading 
  } = useQuery<PaginatedResponse<StoreBrand>>({
    queryKey: ['storeBrands', searchQuery, currentPage, pageSize],
    queryFn: async () => {
      try {
        return await storeBrandRepository.getAllStoreBrands(searchQuery, currentPage, pageSize);
      } catch (err) {
        if (err instanceof Error && err.message === 'Unauthorized access. Please login again.') {
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

  const filteredBrands = storeBrands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSortedBrands = () => {
    return [...filteredBrands].sort((a, b) => {
      if (sortField === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  if (isLoading) {
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
                <div className="flex-grow-1 position-relative">
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
                <div className="dropdown">
                  <button
                    id="sort-button"
                    className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    type="button"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <FaSort size={14} />
                    <span className="d-none d-sm-inline">
                      {sortField === 'name' 
                        ? `Name (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`
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
                          setSortField('name'); 
                          setSortOrder('asc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Name (A-Z)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('name'); 
                          setSortOrder('desc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Name (Z-A)
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
              <div className="d-flex justify-content-sm-end align-items-center gap-2">
                <select
                  className="form-select w-auto"
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
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField(field);
                setSortOrder('asc');
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
              <h5 className="fw-normal text-muted">No store brands found</h5>
              <p className="text-muted small mb-0">Create a new store brand to get started</p>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-muted small">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-outline-secondary"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
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