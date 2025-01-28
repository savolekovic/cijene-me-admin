import React, { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaSort, FaInbox } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { Product } from '../../domain/interfaces/IProductsRepository';
import { ProductsRepository } from '../../infrastructure/ProductsRepository';
import { ProductsTable } from './tables/ProductsTable';
import { ProductFormModal } from './modals/ProductFormModal';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import { CategoriesRepository } from '../../../categories/infrastructure/CategoriesRepository';
import { PaginatedResponse } from '../../../shared/types/PaginatedResponse';
import { CategoryDropdownItem } from '../../../categories/domain/interfaces/ICategoriesRepository';
import { OrderDirection, ProductSortField } from '../../../shared/types/sorting';
import { useDebounceSearch } from '../../../shared/hooks/useDebounceSearch';
import { TableLoadingSpinner } from '../../../shared/presentation/components/TableLoadingSpinner';

const productsRepository = new ProductsRepository();
const categoriesRepository = new CategoriesRepository();

const ProductsPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const {searchQuery, debouncedSearchQuery, setSearchQuery } = useDebounceSearch();
  const [sortField, setSortField] = useState<ProductSortField>(ProductSortField.NAME);
  const [sortOrder, setSortOrder] = useState<OrderDirection>(OrderDirection.ASC);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductBarcode, setNewProductBarcode] = useState('');
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [newProductCategoryId, setNewProductCategoryId] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editCategoryId, setEditCategoryId] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();

  // Query for fetching products
  const { 
    data: productsResponse,
    isLoading: queryLoading 
  } = useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', debouncedSearchQuery, currentPage, pageSize, sortField, sortOrder],
    queryFn: async () => {
      try {
        const data = await productsRepository.getAllProducts(debouncedSearchQuery, currentPage, pageSize, sortField, sortOrder);
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

  const products = productsResponse?.data || [];
  const totalCount = productsResponse?.total_count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Query for fetching categories for dropdowns
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['categories', 'dropdown'],
    queryFn: async () => {
      try {
        return await categoriesRepository.getCategoriesForDropdown();
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          logout();
          navigate('/');
        }
        throw err;
      }
    },
    enabled: showAddModal || editingProduct !== null,
    staleTime: 0 // Fetch fresh data every time
  });

  // Mutation for creating products
  const createMutation = useMutation<Product, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await productsRepository.createProduct(
        formData.get('name') as string,
        formData.get('barcode') as string,
        formData.get('image') as File,
        Number(formData.get('category_id'))
      );
      return response;
    },
    onSuccess: (response) => {
      const categoryId = Number(newProductCategoryId);
      const category = categories.find((cat) => cat.id === categoryId);
      const productWithCategory: Product = {
        id: response.id,
        name: response.name,
        barcode: response.barcode,
        image_url: response.image_url,
        created_at: response.created_at,
        category: {
          id: category!.id,
          name: category!.name
        }
      };
      queryClient.setQueryData(['products', debouncedSearchQuery, currentPage, pageSize, sortField, sortOrder], (oldData: any) => {
        if (!oldData) return { total_count: 1, data: [productWithCategory] };
        return {
          total_count: oldData.total_count + 1,
          data: [...oldData.data, productWithCategory]
        };
      });
      setShowAddModal(false);
      resetAddForm();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      setTimeout(() => setError(''), 3000);
    }
  });

  // Mutation for updating products
  const updateMutation = useMutation<Product, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await productsRepository.updateProduct(
        editingProduct!.id,
        formData.get('name') as string,
        formData.get('barcode') as string,
        formData.get('image') as File,
        Number(formData.get('category_id'))
      );
      return response;
    },
    onSuccess: (response) => {
      const categoryId = Number(editCategoryId);
      const category = categories.find((cat) => cat.id === categoryId);
      const updatedProduct: Product = {
        id: response.id,
        name: response.name,
        barcode: response.barcode,
        image_url: response.image_url,
        created_at: response.created_at,
        category: {
          id: category!.id,
          name: category!.name
        }
      };
      queryClient.setQueryData(['products', debouncedSearchQuery, currentPage, pageSize, sortField, sortOrder], (oldData: any) => {
        if (!oldData) return { total_count: oldData.total_count, data: [updatedProduct] };
        return {
          total_count: oldData.total_count,
          data: oldData.data.map((product: Product) => 
            product.id === updatedProduct.id ? updatedProduct : product
          )
        };
      });
      setEditingProduct(null);
      resetEditForm();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      setTimeout(() => setError(''), 3000);
    }
  });

  // Mutation for deleting products
  const deleteMutation = useMutation({
    mutationFn: (productId: number) => productsRepository.deleteProduct(productId),
    onSuccess: (_, productId) => {
      queryClient.setQueryData<PaginatedResponse<Product>>(['products', debouncedSearchQuery, currentPage, pageSize, sortField, sortOrder], (oldData) => {
        if (!oldData) return { total_count: 0, data: [] };
        return {
          total_count: oldData.total_count - 1,
          data: oldData.data.filter(product => product.id !== productId)
        };
      });
      setDeleteId(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
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

  const resetAddForm = () => {
    setNewProductName('');
    setNewProductBarcode('');
    setNewProductCategoryId(0);
    setNewProductImage(null);
  };

  const resetEditForm = () => {
    setEditName('');
    setEditBarcode('');
    setEditCategoryId(0);
    setEditImage(null);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newProductName);
    formData.append('barcode', newProductBarcode);
    formData.append('category_id', newProductCategoryId.toString());
    if (newProductImage) {
      formData.append('image', newProductImage);
    }
    createMutation.mutate(formData);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditBarcode(product.barcode);
    setEditImage(null);
    setEditCategoryId(product.category.id);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('barcode', editBarcode);
    formData.append('category_id', editCategoryId.toString());
    if (editImage) {
      formData.append('image', editImage);
    }
    updateMutation.mutate(formData);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  const handleSort = (field: ProductSortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === OrderDirection.ASC ? OrderDirection.DESC : OrderDirection.ASC);
    } else {
      setSortField(field);
      setSortOrder(OrderDirection.ASC);
    }
  };

  // Reset to first page when search query or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, pageSize]);

  return (
    <div className="container-fluid px-3 px-sm-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Products</h1>
        <button
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus size={14} />
          <span>Add Product</span>
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
                    placeholder="Search products..."
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
                      {sortField === ProductSortField.NAME 
                        ? `Name (${sortOrder === OrderDirection.ASC ? 'A-Z' : 'Z-A'})`
                        : sortField === ProductSortField.BARCODE
                        ? `Barcode (${sortOrder === OrderDirection.ASC ? 'A-Z' : 'Z-A'})`
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
                          setSortField(ProductSortField.NAME); 
                          setSortOrder(OrderDirection.ASC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Name (A-Z)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(ProductSortField.NAME); 
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
                          setSortField(ProductSortField.BARCODE); 
                          setSortOrder(OrderDirection.ASC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Barcode (A-Z)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(ProductSortField.BARCODE); 
                          setSortOrder(OrderDirection.DESC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Barcode (Z-A)
                      </button>
                      <div className="dropdown-divider my-1"></div>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(ProductSortField.CREATED_AT); 
                          setSortOrder(OrderDirection.DESC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Date (Newest)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(ProductSortField.CREATED_AT); 
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
                  Total Products: {totalCount}
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
              <ProductsTable
                products={products}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
                onEdit={handleEditClick}
                onDelete={setDeleteId}
                deletingProducts={deleteMutation.isPending ? [deleteId!] : []}
              />

              {products.length === 0 && !error && (
                <div className="text-center py-5">
                  <div className="text-muted mb-2">
                    <FaInbox size={48} />
                  </div>
                  <h5 className="fw-normal text-muted">
                    {searchQuery ? 'No products found matching your search.' : 'No products found'}
                  </h5>
                  <p className="text-muted small mb-0">
                    {searchQuery ? 'Try a different search term' : 'Create a new product to get started'}
                  </p>
                </div>
              )}
            </>
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

      <ProductFormModal
        isOpen={showAddModal}
        mode="add"
        onClose={() => {
          setShowAddModal(false);
          resetAddForm();
          setError('');
        }}
        onSubmit={handleCreateProduct}
        categories={categories as CategoryDropdownItem[]}
        isProcessing={createMutation.isPending}
        isLoadingCategories={isLoadingCategories}
        name={newProductName}
        setName={setNewProductName}
        barcode={newProductBarcode}
        setBarcode={setNewProductBarcode}
        categoryId={newProductCategoryId}
        setCategoryId={setNewProductCategoryId}
        image={newProductImage}
        setImage={setNewProductImage}
        error={error}
      />

      <ProductFormModal
        isOpen={!!editingProduct}
        mode="edit"
        onClose={() => {
          setEditingProduct(null);
          resetEditForm();
          setError('');
        }}
        onSubmit={handleEditSubmit}
        categories={categories as CategoryDropdownItem[]}
        isProcessing={updateMutation.isPending}
        isLoadingCategories={isLoadingCategories}
        name={editName}
        setName={setEditName}
        barcode={editBarcode}
        setBarcode={setEditBarcode}
        categoryId={editCategoryId}
        setCategoryId={setEditCategoryId}
        image={editImage}
        setImage={setEditImage}
        error={error}
      />

      <DeleteConfirmationModal 
        isOpen={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        isDeleting={deleteMutation.isPending}
        onClose={() => {
          setDeleteId(null);
          setError('');
        }}
        onConfirm={handleDeleteConfirm}
        error={error}
      />
    </div>
  );
};

export default ProductsPage; 