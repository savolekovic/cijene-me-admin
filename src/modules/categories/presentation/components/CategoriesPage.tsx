import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaSpinner, FaSearch, FaInbox, FaSort, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { Category } from '../../domain/interfaces/ICategoriesRepository';
import { CategoriesRepository } from '../../infrastructure/CategoriesRepository';
import { CategoriesTable } from './CategoriesTable';
import { CategoryFormModal } from './modals/CategoryFormModal';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';

const categoriesRepository = new CategoriesRepository();

type SortField = 'name' | 'created_at';
type SortOrder = 'asc' | 'desc';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
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
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Query for fetching categories
  const { 
    data: categoriesData = [], 
    isLoading: queryLoading 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const data = await categoriesRepository.getAllCategories();
        if (!Array.isArray(data)) {
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

  // Mutation for creating categories
  const createMutation = useMutation<Category, Error, { name: string }>({
    mutationFn: ({ name }) => categoriesRepository.createCategory(name),
    onSuccess: (newCategory) => {
      queryClient.setQueryData(['categories'], (oldData: Category[] | undefined) => 
        oldData ? [...oldData, newCategory] : [newCategory]
      );
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
      queryClient.setQueryData(['categories'], (oldData: Category[] | undefined) =>
        oldData ? oldData.map(category => 
          category.id === updatedCategory.id ? updatedCategory : category
        ) : []
      );
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
    onSuccess: (_, categoryId) => {
      queryClient.setQueryData(['categories'], (oldData: Category[] | undefined) => 
        oldData ? oldData.filter(category => category.id !== categoryId) : []
      );
      setDeleteId(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
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

  const getSortedCategories = () => {
    return [...categoriesData].sort((a, b) => {
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

  const handleSortClick = () => {
    if (sortField === 'name') {
      setSortField('created_at');
      setSortOrder('desc');
    } else if (sortField === 'created_at' && sortOrder === 'desc') {
      setSortField('created_at');
      setSortOrder('asc');
    } else {
      setSortField('name');
      setSortOrder('asc');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newCategory = await categoriesRepository.createCategory(newCategoryName);
      setCategories(prev => [...prev, newCategory]);
      setShowAddModal(false);
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
      const updatedCategory = await categoriesRepository.updateCategory(
        editingCategory.id,
        editName
      );
      setCategories(prev => 
        prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
      );
      setEditingCategory(null);
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
    
    setIsDeleting(true);
    try {
      await categoriesRepository.deleteCategory(deleteId);
      setCategories(prev => prev.filter(cat => cat.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
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
              <div className="d-flex justify-content-start justify-content-sm-end align-items-center h-100">
                <span className="badge bg-secondary">
                  Total Categories: {categoriesData.length}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <CategoriesTable
            categories={getSortedCategories()}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {categoriesData.length === 0 && !error && (
            <div className="text-center py-5">
              <div className="text-muted mb-2">
                <FaInbox size={48} />
              </div>
              <h5 className="fw-normal text-muted">No categories found</h5>
              <p className="text-muted small mb-0">Create a new category to get started</p>
            </div>
          )}
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
        isDeleting={isDeleting}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default CategoriesPage; 