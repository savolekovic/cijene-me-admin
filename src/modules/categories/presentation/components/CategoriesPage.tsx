import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaSpinner, FaSearch, FaInbox, FaSort } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { Category } from '../../domain/interfaces/ICategoriesRepository';
import { CategoriesRepository } from '../../infrastructure/CategoriesRepository';
import { CategoriesTable } from './CategoriesTable';
import { CategoryFormModal } from './modals/CategoryFormModal';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import { OrderDirection, CategorySortField } from '../../../shared/types/sorting';

const categoriesRepository = new CategoriesRepository();

const CategoriesPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<CategorySortField>(CategorySortField.NAME);
  const [sortOrder, setSortOrder] = useState<OrderDirection>(OrderDirection.ASC);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Reset to first page when search query or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  // Query for fetching categories
  const { 
    data: categoriesResponse,
    isLoading: queryLoading 
  } = useQuery({
    queryKey: ['categories', searchQuery, currentPage, pageSize, sortField, sortOrder],
    queryFn: async () => {
      try {
        const data = await categoriesRepository.getAllCategories(searchQuery, currentPage, pageSize, sortField, sortOrder);
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

  const categories = categoriesResponse?.data || [];
  const totalCount = categoriesResponse?.total_count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Mutation for creating categories
  const createMutation = useMutation<Category, Error, { name: string }>({
    mutationFn: ({ name }) => categoriesRepository.createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowAddModal(false);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      setTimeout(() => setError(''), 3000);
    }
  });

  // Mutation for updating categories
  const updateMutation = useMutation<Category, Error, { id: number; name: string }>({
    mutationFn: ({ id, name }) => categoriesRepository.updateCategory(id, name),
    onSuccess: (updatedCategory) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      setTimeout(() => setError(''), 3000);
    }
  });

  // Mutation for deleting categories
  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: (categoryId: number) => categoriesRepository.deleteCategory(categoryId),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteId(null);
      setDeleteError('');
    },
    onError: (err) => {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete category');
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

  const handleSort = (field: CategorySortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === OrderDirection.ASC ? OrderDirection.DESC : OrderDirection.ASC);
    } else {
      setSortField(field);
      setSortOrder(OrderDirection.ASC);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await createMutation.mutateAsync({ name: newCategoryName });
      setNewCategoryName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    setIsEditing(true);
    try {
      await updateMutation.mutateAsync({ id: editingCategory.id, name: editName });
      setEditName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setIsEditing(false);
    }
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
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Categories</h1>
        <button
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus size={14} />
          <span>Add Category</span>
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
                    placeholder="Search categories..."
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
                      {sortField === CategorySortField.NAME 
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
                          setSortField(CategorySortField.NAME); 
                          setSortOrder(OrderDirection.ASC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Name (A-Z)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(CategorySortField.NAME); 
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
                          setSortField(CategorySortField.CREATED_AT); 
                          setSortOrder(OrderDirection.DESC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Date (Newest)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(CategorySortField.CREATED_AT); 
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
                  Total Categories: {totalCount}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <CategoriesTable
            categories={categories}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {categories.length === 0 && !error && (
            <div className="text-center py-5">
              <div className="text-muted mb-2">
                <FaInbox size={48} />
              </div>
              <h5 className="fw-normal text-muted">
                {searchQuery ? 'No categories found matching your search.' : 'No categories found'}
              </h5>
              <p className="text-muted small mb-0">Create a new category to get started</p>
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

      <CategoryFormModal
        isOpen={showAddModal}
        mode="add"
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        isProcessing={isCreating}
        name={newCategoryName}
        setName={setNewCategoryName}
      />

      <CategoryFormModal
        isOpen={!!editingCategory}
        mode="edit"
        onClose={() => setEditingCategory(null)}
        onSubmit={handleEditSubmit}
        isProcessing={isEditing}
        name={editName}
        setName={setEditName}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        isDeleting={deleteMutation.isPending}
        onClose={() => {
          setDeleteId(null);
          setDeleteError('');
        }}
        onConfirm={handleDeleteConfirm}
        error={deleteError}
      />
    </div>
  );
};

export default CategoriesPage; 