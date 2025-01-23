import React, { useEffect, useState } from 'react';
import { FaPlus, FaInbox, FaSearch, FaSort, FaSortUp, FaSortDown, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { ProductEntry } from '../../domain/interfaces/IProductEntriesRepository';
import { ProductEntriesRepository } from '../../infrastructure/ProductEntriesRepository';
import { ProductsRepository } from '../../infrastructure/ProductsRepository';
import { StoreLocationRepository } from '../../../stores/infrastructure/StoreLocationRepository';
import { SortField } from '../utils/sorting';
import { ProductEntriesTable } from './tables/ProductEntriesTable';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import { ProductEntryFormModal } from './modals/ProductEntryFormModal';

const productEntriesRepository = new ProductEntriesRepository();
const productsRepository = new ProductsRepository();
const storeLocationRepository = new StoreLocationRepository();

const ProductEntriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntryProductId, setNewEntryProductId] = useState(0);
  const [newEntryStoreLocationId, setNewEntryStoreLocationId] = useState(0);
  const [newEntryPrice, setNewEntryPrice] = useState('');
  const [editingEntry, setEditingEntry] = useState<ProductEntry | null>(null);
  const [editProductId, setEditProductId] = useState(0);
  const [editStoreLocationId, setEditStoreLocationId] = useState(0);
  const [editPrice, setEditPrice] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('product_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Query for fetching entries
  const { 
    data: productEntries = [], 
    isLoading: queryLoading 
  } = useQuery({
    queryKey: ['productEntries'],
    queryFn: async () => {
      try {
        const data = await productEntriesRepository.getAllProductEntries();
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

  // Query for dropdown data
  const {
    data: dropdownData = { products: [], storeLocations: [] },
    isLoading: isLoadingDropdownData
  } = useQuery({
    queryKey: ['dropdownData'],
    queryFn: async () => {
      const [products, storeLocations] = await Promise.all([
        productsRepository.getAllProducts(),
        storeLocationRepository.getAllStoreLocations()
      ]);
      return { products, storeLocations };
    },
    enabled: showAddModal || !!editingEntry
  });

  // Mutation for creating entries
  const createMutation = useMutation({
    mutationFn: async () => {
      return productEntriesRepository.createProductEntry(
        Number(newEntryProductId),
        Number(newEntryStoreLocationId),
        Number(newEntryPrice)
      );
    },
    onSuccess: (newEntry) => {
      queryClient.setQueryData(['productEntries'], (oldData: ProductEntry[] | undefined) => 
        oldData ? [...oldData, newEntry] : [newEntry]
      );
      resetAddForm();
      setShowAddModal(false);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create product entry');
      setTimeout(() => setError(''), 3000);
    }
  });

  // Mutation for updating entries
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingEntry) throw new Error('No entry selected for editing');
      return productEntriesRepository.updateProductEntry(
        editingEntry.id,
        Number(editProductId),
        Number(editStoreLocationId),
        Number(editPrice)
      );
    },
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData(['productEntries'], (oldData: ProductEntry[] | undefined) =>
        oldData ? oldData.map(entry =>
          entry.id === updatedEntry.id ? updatedEntry : entry
        ) : []
      );
      resetEditForm();
      setEditingEntry(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to update product entry');
      setTimeout(() => setError(''), 3000);
    }
  });

  // Mutation for deleting entries
  const deleteMutation = useMutation({
    mutationFn: (entryId: number) => productEntriesRepository.deleteProductEntry(entryId),
    onSuccess: (_, entryId) => {
      queryClient.setQueryData(['productEntries'], (oldData: ProductEntry[] | undefined) => 
        oldData ? oldData.filter(entry => entry.id !== entryId) : []
      );
      setDeleteId(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to delete product entry');
      setTimeout(() => setError(''), 3000);
    }
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('sortDropdown');
      const button = document.getElementById('sortButton');
      if (
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
  }, []);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />;
    return sortOrder === 'asc' ?
      <FaSortUp className="ms-1 text-primary" /> :
      <FaSortDown className="ms-1 text-primary" />;
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const handleEditClick = (entry: ProductEntry) => {
    setEditingEntry(entry);
    setEditProductId(entry.product.id);
    setEditStoreLocationId(entry.store_location.id);
    setEditPrice(entry.price.toString());
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  const filteredEntries = productEntries.filter(entry =>
    entry.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.store_location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.store_location.store_brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedAndFilteredEntries = [...filteredEntries].sort((a, b) => {
    switch (sortField) {
      case 'product_name':
        return sortOrder === 'asc' ? 
          a.product.name.localeCompare(b.product.name) :
          b.product.name.localeCompare(a.product.name);
      case 'store_brand_name':
        return sortOrder === 'asc' ?
          a.store_location.store_brand.name.localeCompare(b.store_location.store_brand.name) :
          b.store_location.store_brand.name.localeCompare(a.store_location.store_brand.name);
      case 'store_address':
        return sortOrder === 'asc' ?
          a.store_location.address.localeCompare(b.store_location.address) :
          b.store_location.address.localeCompare(a.store_location.address);
      case 'price':
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      case 'created_at':
        return sortOrder === 'asc' ?
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime() :
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

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
        <h1 className="h3 mb-0">Product Entries</h1>
        <button 
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus size={14} />
          <span>Add Entry</span>
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
                    placeholder="Search entries..."
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
                    id="sortButton"
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <FaSort size={14} />
                    <span>Sort</span>
                  </button>
                  <div 
                    id="sortDropdown"
                    className={`dropdown-menu dropdown-menu-end shadow-sm ${isDropdownOpen ? 'show' : ''}`}
                    style={{ minWidth: '200px' }}
                  >
                    <button 
                      className="dropdown-item d-flex justify-content-between align-items-center"
                      onClick={() => { handleSort('product_name'); setIsDropdownOpen(false); }}
                    >
                      <span>Product Name</span>
                      {getSortIcon('product_name')}
                    </button>
                    <button 
                      className="dropdown-item d-flex justify-content-between align-items-center"
                      onClick={() => { handleSort('store_brand_name'); setIsDropdownOpen(false); }}
                    >
                      <span>Store Brand</span>
                      {getSortIcon('store_brand_name')}
                    </button>
                    <button 
                      className="dropdown-item d-flex justify-content-between align-items-center"
                      onClick={() => { handleSort('store_address'); setIsDropdownOpen(false); }}
                    >
                      <span>Store Location</span>
                      {getSortIcon('store_address')}
                    </button>
                    <button 
                      className="dropdown-item d-flex justify-content-between align-items-center"
                      onClick={() => { handleSort('price'); setIsDropdownOpen(false); }}
                    >
                      <span>Price</span>
                      {getSortIcon('price')}
                    </button>
                    <button 
                      className="dropdown-item d-flex justify-content-between align-items-center"
                      onClick={() => { handleSort('created_at'); setIsDropdownOpen(false); }}
                    >
                      <span>Date</span>
                      {getSortIcon('created_at')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-4 col-md-6">
              <div className="d-flex justify-content-start justify-content-sm-end align-items-center h-100">
                <span className="badge bg-secondary">
                  Total Entries: {filteredEntries.length}
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
          <ProductEntriesTable
            entries={sortedAndFilteredEntries}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEditClick}
            onDelete={setDeleteId}
          />

          {filteredEntries.length === 0 && !error && (
            <div className="text-center py-5">
              <div className="text-muted mb-2">
                <FaInbox size={48} />
              </div>
              <h5 className="fw-normal text-muted">
                {searchQuery ? 'No matching entries found' : 'No entries found'}
              </h5>
              <p className="text-muted small mb-0">
                {searchQuery ? 'Try adjusting your search' : 'Create a new entry to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      <ProductEntryFormModal
        isOpen={showAddModal || !!editingEntry}
        onClose={() => editingEntry ? setEditingEntry(null) : setShowAddModal(false)}
        onSubmit={editingEntry ? handleEditSubmit : handleCreateEntry}
        products={dropdownData.products}
        storeLocations={dropdownData.storeLocations}
        isLoadingDropdownData={isLoadingDropdownData}
        isProcessing={editingEntry ? updateMutation.isPending : createMutation.isPending}
        productId={editingEntry ? editProductId : newEntryProductId}
        setProductId={editingEntry ? setEditProductId : setNewEntryProductId}
        locationId={editingEntry ? editStoreLocationId : newEntryStoreLocationId}
        setLocationId={editingEntry ? setEditStoreLocationId : setNewEntryStoreLocationId}
        price={editingEntry ? editPrice : newEntryPrice}
        setPrice={editingEntry ? setEditPrice : setNewEntryPrice}
        mode={editingEntry ? 'edit' : 'add'}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        title="Delete Product Entry"
        message="Are you sure you want to delete this product entry?"
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ProductEntriesPage; 