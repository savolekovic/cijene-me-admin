import React, { useEffect, useState } from 'react';
import { FaPlus, FaInbox, FaSearch, FaArrowLeft, FaSort } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { ProductEntry } from '../../domain/interfaces/IProductEntriesRepository';
import { ProductEntriesRepository } from '../../infrastructure/ProductEntriesRepository';
import { ProductsRepository } from '../../infrastructure/ProductsRepository';
import { StoreLocationRepository } from '../../../stores/infrastructure/StoreLocationRepository';
import { ProductEntrySortField, OrderDirection } from '../../../shared/types/sorting';
import { ProductEntriesTable } from './tables/ProductEntriesTable';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import { ProductEntryFormModal } from './modals/ProductEntryFormModal';
import { PaginatedResponse } from '../../../shared/types/PaginatedResponse';
import { StoreBrandRepository } from '../../../stores/infrastructure/StoreBrandRepository';
import { useDebounceSearch } from '../../../shared/hooks/useDebounceSearch';
import { TableLoadingSpinner } from '../../../shared/presentation/components/TableLoadingSpinner';
import { ProductImage } from '../../../shared/presentation/components/ProductImage';

const productEntriesRepository = new ProductEntriesRepository();
const productsRepository = new ProductsRepository();
const storeLocationRepository = new StoreLocationRepository();
const storeBrandRepository = new StoreBrandRepository();

const ProductEntriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [error, setError] = useState<string>('');
  const { searchQuery, debouncedSearchQuery, setSearchQuery } = useDebounceSearch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntryStoreBrandId, setNewEntryStoreBrandId] = useState(0);
  const [newEntryStoreLocationId, setNewEntryStoreLocationId] = useState(0);
  const [newEntryPrice, setNewEntryPrice] = useState('');
  const [editingEntry, setEditingEntry] = useState<ProductEntry | null>(null);
  const [editStoreBrandId, setEditStoreBrandId] = useState(0);
  const [editStoreLocationId, setEditStoreLocationId] = useState(0);
  const [editPrice, setEditPrice] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<ProductEntrySortField>(ProductEntrySortField.CREATED_AT);
  const [sortOrder, setSortOrder] = useState<OrderDirection>(OrderDirection.DESC);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Query for product details
  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      try {
        return await productsRepository.getProduct(Number(productId));
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          logout();
          navigate('/');
        }
        throw err;
      }
    },
    enabled: !!productId
  });

  // Query for product entries
  const { 
    data: productEntriesResponse = { data: [], total_count: 0 },
    isLoading: queryLoading,
    isFetching: isEntriesFetching
  } = useQuery<PaginatedResponse<ProductEntry>>({
    queryKey: ['productEntries', productId, debouncedSearchQuery, currentPage, pageSize, sortField, sortOrder],
    queryFn: async () => {
      try {
        return await productEntriesRepository.getAllProductEntries(
          debouncedSearchQuery,
          Number(productId),
          currentPage,
          pageSize,
          sortField,
          sortOrder
        );
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          logout();
          navigate('/');
        }
        throw err;
      }
    },
    enabled: !!productId
  });

  // Query for products dropdown (only when needed)
  const {
    data: products = [],
    isLoading: isProductsLoading
  } = useQuery({
    queryKey: ['products', 'dropdown'],
    queryFn: () => productsRepository.getProductsForDropdown(),
    enabled: showAddModal || !!editingEntry,
    staleTime: 0 // Fetch fresh data every time
  });

  // Query for store brands dropdown
  const {
    data: storeBrands = [],
    isLoading: isStoreBrandsLoading
  } = useQuery({
    queryKey: ['store-brands', 'dropdown'],
    queryFn: () => storeBrandRepository.getStoreBrandsForDropdown(),
    enabled: showAddModal || !!editingEntry,
    staleTime: 0 // Fetch fresh data every time
  });

  // Query for store locations dropdown based on selected store brand
  const { 
    data: storeLocations = [], 
    isLoading: isLocationsLoading
  } = useQuery({
    queryKey: ['store-locations', 'dropdown', editingEntry ? editStoreBrandId : newEntryStoreBrandId],
    queryFn: async () => {
      try {
        const selectedBrandId = editingEntry ? editStoreBrandId : newEntryStoreBrandId;
        if (!selectedBrandId) return [];
        
        return await storeLocationRepository.getStoreLocationsForDropdown({
          store_brand_id: selectedBrandId
        });
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          logout();
          navigate('/');
        }
        throw err;
      }
    },
    enabled: (showAddModal || !!editingEntry) && 
      (editingEntry ? editStoreBrandId > 0 : newEntryStoreBrandId > 0),
    staleTime: 0 // Fetch fresh data every time
  });

  useEffect(() => {
    if (editingEntry) {
      setEditStoreBrandId(editingEntry.store_location.store_brand.id);
      setEditStoreLocationId(editingEntry.store_location.id);
      setEditPrice(editingEntry.price.toString());
    }
  }, [editingEntry]);

  // Add click outside handler
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

  const isLoadingDropdownData = isProductsLoading || isStoreBrandsLoading || isLocationsLoading;

  // Mutation for creating entries
  const createMutation = useMutation<ProductEntry, Error>({
    mutationFn: async () => {
      return productEntriesRepository.createProductEntry(
        Number(productId),
        Number(newEntryStoreLocationId),
        Number(newEntryPrice)
      );
    },
    onSuccess: (response) => {
      const storeLocation = storeLocations.find(loc => loc.id === Number(newEntryStoreLocationId));
      const storeBrand = storeBrands.find(brand => brand.id === Number(newEntryStoreBrandId));
      
      const entryWithLocation: ProductEntry = {
        ...response,
        store_location: {
          id: storeLocation!.id,
          address: storeLocation!.address,
          store_brand: {
            id: storeBrand!.id,
            name: storeBrand!.name
          }
        }
      };

      queryClient.setQueryData<PaginatedResponse<ProductEntry>>(
        ['productEntries', productId, debouncedSearchQuery, currentPage, pageSize, sortField, sortOrder],
        (oldData) => {
          if (!oldData) return { total_count: 1, data: [entryWithLocation] };
          return {
            total_count: oldData.total_count + 1,
            data: [entryWithLocation, ...oldData.data]
          };
        }
      );
      
      resetAddForm();
      setShowAddModal(false);
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create product entry');
      setTimeout(() => setError(''), 3000);
    }
  });

  // Mutation for updating entries
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingEntry) throw new Error('No entry selected for editing');
      return productEntriesRepository.updateProductEntry(
        editingEntry.id,
        Number(productId),
        Number(editStoreLocationId),
        Number(editPrice)
      );
    },
    onSuccess: (updatedEntry) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['productEntries'] });
      
      // Optimistically update the cache
      queryClient.setQueryData<PaginatedResponse<ProductEntry>>(
        ['productEntries', debouncedSearchQuery, currentPage, pageSize, sortField, sortOrder],
        (oldData) => {
          if (!oldData) return { total_count: 1, data: [updatedEntry] };
          return {
            ...oldData,
            data: oldData.data.map((entry) => 
              entry.id === updatedEntry.id ? updatedEntry : entry
            )
          };
        }
      );
      
      resetEditForm();
      setEditingEntry(null);
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to update product entry');
      setTimeout(() => setError(''), 3000);
    }
  });

  // Mutation for deleting entries
  const deleteMutation = useMutation({
    mutationFn: (entryId: number) => productEntriesRepository.deleteProductEntry(entryId),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['productEntries'] });
      
      // Optimistically update the cache
      queryClient.setQueryData<PaginatedResponse<ProductEntry>>(
        ['productEntries', debouncedSearchQuery, currentPage, pageSize, sortField, sortOrder],
        (oldData) => {
          if (!oldData) return { total_count: 0, data: [] };
          return {
            ...oldData,
            total_count: oldData.total_count - 1,
            data: oldData.data.filter((entry) => entry.id !== deletedId)
          };
        }
      );
      
      setDeleteId(null);
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to delete product entry');
      setTimeout(() => setError(''), 3000);
    }
  });

  const resetAddForm = () => {
    setNewEntryStoreBrandId(0);
    setNewEntryStoreLocationId(0);
    setNewEntryPrice('');
  };

  const resetEditForm = () => {
    setEditStoreBrandId(0);
    setEditStoreLocationId(0);
    setEditPrice('');
  };

  const handleSort = (field: ProductEntrySortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === OrderDirection.ASC ? OrderDirection.DESC : OrderDirection.ASC);
    } else {
      setSortField(field);
      setSortOrder(OrderDirection.ASC);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const handleEditClick = (entry: ProductEntry) => {
    setEditingEntry(entry);
    setEditStoreLocationId(entry.store_location.id);
    setEditStoreBrandId(entry.store_location.store_brand.id);
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

  // Reset to first page when search query or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, pageSize]);

  return (
    <div className="container-fluid px-3 px-sm-4 pt-2">
      <div className="d-flex flex-column gap-3">
        {/* Product Header */}
        <div>
          {/* Desktop View */}
          <div className="d-none d-md-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-link text-secondary p-0"
                onClick={() => navigate('/dashboard/products')}
              >
                <FaArrowLeft size={20} />
              </button>
              <div className="d-flex align-items-center gap-3">
                <ProductImage 
                  imageUrl={product?.image_url || null} 
                  name={product?.name || ''} 
                  size="large" 
                />
                <div>
                  <h1 className="h3 mb-1">{product?.name || 'Loading...'}</h1>
                  <p className="text-muted mb-0">Price History</p>
                </div>
              </div>
            </div>
            <button 
              className="btn btn-primary d-inline-flex align-items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus size={14} />
              <span>Add Entry</span>
            </button>
          </div>

          {/* Mobile View */}
          <div className="d-md-none">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-link text-secondary p-0 d-flex align-items-center"
                  onClick={() => navigate('/dashboard/products')}
                  style={{ height: '24px' }}
                >
                  <FaArrowLeft size={16} />
                </button>
                <div>
                  <h1 className="h5 mb-0">{product?.name || 'Loading...'}</h1>
                  <p className="text-muted small mb-0">Price History</p>
                </div>
              </div>
              <button 
                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus size={12} />
                <span>Add</span>
              </button>
            </div>
            <div className="mb-2">
              <ProductImage 
                imageUrl={product?.image_url || null} 
                name={product?.name || ''} 
                size="small"
              />
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card shadow-sm">
          <div className="card-header border-0 bg-white py-2">
            <div className="row g-3 mb-0">
              <div className="col-12 col-sm-8 col-md-6">
                <div className="d-flex gap-2">
                  {/* Desktop Search */}
                  <div className="d-none d-md-flex flex-grow-1 input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by store location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FaSearch 
                      className="position-absolute text-muted" 
                      style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                      size={14}
                    />
                  </div>

                  {/* Mobile Search */}
                  <div className="d-flex d-md-none flex-grow-1 input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="input-group-text bg-white px-2">
                      <FaSearch className="text-muted" size={14} />
                    </span>
                  </div>

                  {/* Desktop Sort Button */}
                  <div className="d-none d-md-block position-relative">
                    <button 
                      id="sort-button"
                      className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <FaSort size={14} />
                      <span>
                        {sortField === ProductEntrySortField.PRICE 
                          ? `Price (${sortOrder === OrderDirection.ASC ? '↑' : '↓'})` 
                          : `Date (${sortOrder === OrderDirection.ASC ? 'Oldest' : 'Newest'})`}
                      </span>
                    </button>
                  </div>

                  {/* Mobile Sort Button */}
                  <div className="d-md-none position-relative">
                    <button 
                      id="sort-button-mobile"
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <FaSort size={12} />
                      <span>Sort</span>
                    </button>
                  </div>

                  {isDropdownOpen && (
                    <div 
                      id="sort-dropdown"
                      className="position-absolute end-0 mt-1 py-1 bg-white rounded shadow-sm" 
                      style={{ 
                        zIndex: 1000, 
                        minWidth: '160px',
                        border: '1px solid rgba(0,0,0,.15)',
                        top: '100%'
                      }}
                    >
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(ProductEntrySortField.PRICE);
                          setSortOrder(OrderDirection.ASC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Price (low to high)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(ProductEntrySortField.PRICE);
                          setSortOrder(OrderDirection.DESC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Price (high to low)
                      </button>
                      <div className="dropdown-divider my-1"></div>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(ProductEntrySortField.CREATED_AT);
                          setSortOrder(OrderDirection.DESC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Date (Newest)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(ProductEntrySortField.CREATED_AT);
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
              <div className="col-12 col-sm-4 col-md-6">
                <div className="d-flex justify-content-between justify-content-sm-end align-items-center gap-2">
                  <select 
                    className="form-select form-select-sm d-md-none" 
                    style={{ width: 'auto' }}
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                  </select>
                  <select 
                    className="form-select d-none d-md-block" 
                    style={{ width: 'auto' }}
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                  </select>
                  <span className="badge bg-secondary d-none d-md-inline">
                    Total Entries: {productEntriesResponse.total_count}
                  </span>
                  <span className="badge bg-secondary d-md-none">
                    {productEntriesResponse.total_count}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            {queryLoading ? (
              <TableLoadingSpinner />
            ) : (
              <>
                <ProductEntriesTable
                  entries={productEntriesResponse.data}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  onEdit={handleEditClick}
                  onDelete={setDeleteId}
                  deletingEntries={deleteMutation.isPending ? [deleteId!] : []}
                />
                {productEntriesResponse.data.length === 0 && !error && (
                  <div className="text-center py-5">
                    <div className="text-muted mb-2">
                      <FaInbox size={48} />
                    </div>
                    <h5 className="fw-normal text-muted">
                      {searchQuery ? 'No matching entries found' : 'No price entries yet'}
                    </h5>
                    <p className="text-muted small mb-0">
                      {searchQuery ? 'Try adjusting your search' : 'Add your first price entry to start tracking'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-center align-items-center gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isEntriesFetching}
          >
            Previous
          </button>
          <span className="text-muted small">
            Page {currentPage} of {Math.ceil(productEntriesResponse.total_count / pageSize)}
          </span>
          <button
            className="btn btn-outline-secondary"
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(productEntriesResponse.total_count / pageSize), prev + 1))}
            disabled={currentPage === Math.ceil(productEntriesResponse.total_count / pageSize) || isEntriesFetching}
          >
            Next
          </button>
        </div>

        {/* Modals */}
        <ProductEntryFormModal
          isOpen={showAddModal || !!editingEntry}
          onClose={() => {
            if (editingEntry) {
              setEditingEntry(null);
              resetEditForm();
            } else {
              setShowAddModal(false);
              resetAddForm();
            }
          }}
          onSubmit={editingEntry ? handleEditSubmit : handleCreateEntry}
          products={products}
          storeBrands={storeBrands}
          storeLocations={storeLocations}
          isLoadingDropdownData={isLoadingDropdownData}
          isProcessing={editingEntry ? updateMutation.isPending : createMutation.isPending}
          productId={Number(productId)}
          setProductId={() => {}}
          disableProductSelection={true}
          storeBrandId={editingEntry ? editStoreBrandId : newEntryStoreBrandId}
          setStoreBrandId={editingEntry ? setEditStoreBrandId : setNewEntryStoreBrandId}
          locationId={editingEntry ? editStoreLocationId : newEntryStoreLocationId}
          setLocationId={editingEntry ? setEditStoreLocationId : setNewEntryStoreLocationId}
          price={editingEntry ? editPrice : newEntryPrice}
          setPrice={editingEntry ? setEditPrice : setNewEntryPrice}
          mode={editingEntry ? 'edit' : 'add'}
        />

        <DeleteConfirmationModal
          isOpen={!!deleteId}
          title="Delete Price Entry"
          message="Are you sure you want to delete this price entry?"
          isDeleting={deleteMutation.isPending}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
};

export default ProductEntriesPage; 