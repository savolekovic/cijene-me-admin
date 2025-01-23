import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const [error, setError] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStoreBrandName, setNewStoreBrandName] = useState('');

  // Edit Modal State
  const [editingStoreBrand, setEditingStoreBrand] = useState<StoreBrand | null>(null);
  const [editName, setEditName] = useState('');

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query for fetching store brands
  const { data: storeBrands = [], isLoading } = useQuery({
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

  // Mutation for creating store brands
  const createMutation = useMutation({
    mutationFn: (name: string) => storeBrandRepository.createStoreBrand(name),
    onSuccess: (newStoreBrand) => {
      queryClient.setQueryData(['storeBrands'], (old: StoreBrand[] = []) => [...old, newStoreBrand]);
      setShowAddModal(false);
      setNewStoreBrandName('');
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create store brand');
    }
  });

  // Mutation for updating store brands
  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => 
      storeBrandRepository.updateStoreBrand(id, name),
    onSuccess: (updatedBrand) => {
      queryClient.setQueryData(['storeBrands'], (old: StoreBrand[] = []) =>
        old.map(brand => brand.id === updatedBrand.id ? updatedBrand : brand)
      );
      setEditingStoreBrand(null);
      setEditName('');
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to update store brand');
    }
  });

  // Mutation for deleting store brands
  const deleteMutation = useMutation({
    mutationFn: (id: number) => storeBrandRepository.deleteStoreBrand(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['storeBrands'], (old: StoreBrand[] = []) =>
        old.filter(brand => brand.id !== deletedId)
      );
      setDeleteId(null);
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to delete store brand');
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

  if (isLoading) {
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
        <h1 className="h3 mb-0">Store Brands Management</h1>
        <button
          className="btn btn-primary w-100 w-sm-auto"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Add Store Brand
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <StoreBrandsTable
            storeBrands={storeBrands}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {storeBrands.length === 0 && !error && (
            <div className="text-center py-4">
              <p className="text-muted mb-0">No store brands found.</p>
            </div>
          )}
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