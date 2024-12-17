import { useState } from 'react';
import { ProductEntry } from '../../domain/interfaces/IProductEntriesRepository';

export const useProductEntryModals = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProductEntry | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for Add Modal
  const [newEntryProductId, setNewEntryProductId] = useState<number>(0);
  const [newEntryStoreLocationId, setNewEntryStoreLocationId] = useState<number>(0);
  const [newEntryPrice, setNewEntryPrice] = useState<string>('');

  // Form state for Edit Modal
  const [editProductId, setEditProductId] = useState<number>(0);
  const [editStoreLocationId, setEditStoreLocationId] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<string>('');

  const resetAddForm = () => {
    setNewEntryProductId(0);
    setNewEntryStoreLocationId(0);
    setNewEntryPrice('');
  };

  const resetEditForm = () => {
    setEditProductId(0);
    setEditStoreLocationId(0);
    setEditPrice('');
  };

  return {
    // Add Modal
    showAddModal,
    setShowAddModal,
    isCreating,
    setIsCreating,
    newEntryProductId,
    setNewEntryProductId,
    newEntryStoreLocationId,
    setNewEntryStoreLocationId,
    newEntryPrice,
    setNewEntryPrice,
    resetAddForm,

    // Edit Modal
    editingEntry,
    setEditingEntry,
    isEditing,
    setIsEditing,
    editProductId,
    setEditProductId,
    editStoreLocationId,
    setEditStoreLocationId,
    editPrice,
    setEditPrice,
    resetEditForm,

    // Delete Modal
    deleteId,
    setDeleteId,
  };
}; 