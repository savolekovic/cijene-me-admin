import React, { useEffect, useState } from 'react';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { Category } from '../../domain/interfaces/ICategoriesRepository';
import { CategoriesRepository } from '../../infrastructure/CategoriesRepository';
import { CategoriesTable } from './CategoriesTable';
import { CategoryFormModal } from './modals/CategoryFormModal';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';

const categoriesRepository = new CategoriesRepository();

type SortField = 'id' | 'name' | 'created_at';
type SortOrder = 'asc' | 'desc';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('id');
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

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesRepository.getAllCategories();
      setCategories(data);
      setError('');
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized access. Please login again.') {
        logout();
        navigate('/');
      } else {
        setError('Failed to load categories');
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

  if (isLoading) {
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

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <h1 className="h3 mb-0">Categories Management</h1>
        <button
          className="btn btn-primary w-100 w-sm-auto"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Add Category
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <CategoriesTable
            categories={categories}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {categories.length === 0 && !error && (
            <div className="text-center py-4">
              <p className="text-muted">No categories found.</p>
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