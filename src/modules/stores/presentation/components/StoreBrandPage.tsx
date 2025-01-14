import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { StoreBrand } from '../../domain/interfaces/IStoreBrandRepository';
import { StoreBrandRepository } from '../../infrastructure/StoreBrandRepository';
import { StoreBrandFormModal } from './modals/StoreBrandFormModal';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import { StoreBrandsTable } from './tables/StoreBrandsTable';
import { LoadingSpinner } from '../../../shared/presentation/components/LoadingSpinner';

const storeBrandRepository = new StoreBrandRepository();

type SortField = 'id' | 'name' | 'created_at';
type SortOrder = 'asc' | 'desc';

const StoreBrandPage: React.FC = () => {
  const [storeBrands, setStoreBrands] = useState<StoreBrand[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
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

  useEffect(() => {
    fetchStoreBrands();
  }, []);

  const fetchStoreBrands = async () => {
    try {
      const data = await storeBrandRepository.getAllStoreBrands();
      setStoreBrands(data);
      setError('');
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized access. Please login again.') {
        logout();
        navigate('/');
      } else {
        setError('Failed to load store brands');
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
      const newStoreBrand = await storeBrandRepository.createStoreBrand(newStoreBrandName);
      setStoreBrands(prev => [...prev, newStoreBrand]);
      setShowAddModal(false);
      setNewStoreBrandName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store brand');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (brand: StoreBrand) => {
    setEditingStoreBrand(brand);
    setEditName(brand.name);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStoreBrand) return;
    
    setIsEditing(true);
    try {
      const updatedBrand = await storeBrandRepository.updateStoreBrand(
        editingStoreBrand.id,
        editName
      );
      setStoreBrands(prev => 
        prev.map(brand => brand.id === updatedBrand.id ? updatedBrand : brand)
      );
      setEditingStoreBrand(null);
      setEditName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update store brand');
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
      await storeBrandRepository.deleteStoreBrand(deleteId);
      setStoreBrands(prev => prev.filter(brand => brand.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete store brand');
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
        <h1 className="h3 mb-0">Store Brands</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Add Store Brand
        </button>
      </div>

      <StoreBrandsTable
        storeBrands={storeBrands}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <StoreBrandFormModal
        isOpen={showAddModal}
        mode="add"
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        isProcessing={isCreating}
        name={newStoreBrandName}
        setName={setNewStoreBrandName}
      />

      <StoreBrandFormModal
        isOpen={!!editingStoreBrand}
        mode="edit"
        onClose={() => setEditingStoreBrand(null)}
        onSubmit={handleEditSubmit}
        isProcessing={isEditing}
        name={editName}
        setName={setEditName}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        title="Delete Store Brand"
        message="Are you sure you want to delete this store brand?"
        isDeleting={isDeleting}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default StoreBrandPage; 