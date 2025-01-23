import React, { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaSort, FaInbox, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { Product } from '../../domain/interfaces/IProductsRepository';
import { ProductsRepository } from '../../infrastructure/ProductsRepository';
import { ProductsTable, SortField } from './ProductsTable';
import { ProductFormModal } from './modals/ProductFormModal';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import { CategoriesRepository } from '../../../categories/infrastructure/CategoriesRepository';

const productsRepository = new ProductsRepository();
const categoriesRepository = new CategoriesRepository();

type SortOrder = 'asc' | 'desc';

const ProductsPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const queryClient = useQueryClient();

  // Query for fetching products
  const { 
    data: products = [], 
    isLoading: queryLoading 
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const data = await productsRepository.getAllProducts();
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

  // Query for fetching categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesRepository.getAllCategories(),
    enabled: showAddModal || !!editingProduct
  });

  // Mutation for creating products
  const createMutation = useMutation({
    mutationFn: async () => {
      return productsRepository.createProduct(
        newProductName,
        newProductBarcode,
        newProductImage!,
        newProductCategoryId
      );
    },
    onSuccess: (response) => {
      const category = categories.find(cat => cat.id === newProductCategoryId);
      const productWithCategory: Product = {
        id: response.id,
        name: response.name,
        barcode: response.barcode,
        image_url: response.image_url,
        created_at: response.created_at,
        category: category || { id: newProductCategoryId, name: 'Unknown' }
      };
      
      queryClient.setQueryData(['products'], (oldData: Product[] | undefined) => 
        oldData ? [...oldData, productWithCategory] : [productWithCategory]
      );
      setShowAddModal(false);
      resetAddForm();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      setTimeout(() => setError(''), 3000);
    }
  });

  // Mutation for updating products
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingProduct) throw new Error('No product selected for editing');
      return productsRepository.updateProduct(
        editingProduct.id,
        editName,
        editBarcode,
        editImage,
        editCategoryId
      );
    },
    onSuccess: (response) => {
      const category = categories.find(cat => cat.id === editCategoryId);
      const updatedProduct: Product = {
        id: response.id,
        name: response.name,
        barcode: response.barcode,
        image_url: response.image_url || editingProduct!.image_url,
        created_at: response.created_at,
        category: category || { id: editCategoryId, name: 'Unknown' }
      };

      queryClient.setQueryData(['products'], (oldData: Product[] | undefined) =>
        oldData ? oldData.map(product =>
          product.id === updatedProduct.id ? updatedProduct : product
        ) : []
      );
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
      queryClient.setQueryData(['products'], (oldData: Product[] | undefined) => 
        oldData ? oldData.filter(product => product.id !== productId) : []
      );
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
    setNewProductImage(null);
    setNewProductCategoryId(0);
  };

  const resetEditForm = () => {
    setEditName('');
    setEditBarcode('');
    setEditImage(null);
    setEditCategoryId(0);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
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
    updateMutation.mutate();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                      {sortField === 'name' 
                        ? `Name (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`
                        : sortField === 'barcode'
                        ? `Barcode (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`
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
                          setSortField('barcode'); 
                          setSortOrder('asc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Barcode (A-Z)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('barcode'); 
                          setSortOrder('desc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Barcode (Z-A)
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
                  Total Products: {products.length}
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
          <ProductsTable
            products={filteredProducts}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={(field) => {
              setSortField(field);
              setSortOrder('asc');
            }}
            onEdit={handleEditClick}
            onDelete={setDeleteId}
          />

          {products.length === 0 && !error && (
            <div className="text-center py-5">
              <div className="text-muted mb-2">
                <FaInbox size={48} />
              </div>
              <h5 className="fw-normal text-muted">No products found</h5>
              <p className="text-muted small mb-0">Create a new product to get started</p>
            </div>
          )}
        </div>
      </div>

      <ProductFormModal
        isOpen={showAddModal}
        mode="add"
        onClose={() => {
          setShowAddModal(false);
          resetAddForm();
        }}
        onSubmit={handleCreateProduct}
        categories={categories}
        isProcessing={createMutation.isPending}
        isLoadingCategories={isLoadingCategories}
        name={newProductName}
        setName={setNewProductName}
        barcode={newProductBarcode}
        setBarcode={setNewProductBarcode}
        image={newProductImage}
        setImage={setNewProductImage}
        categoryId={newProductCategoryId}
        setCategoryId={setNewProductCategoryId}
      />

      <ProductFormModal
        isOpen={!!editingProduct}
        mode="edit"
        onClose={() => {
          setEditingProduct(null);
          resetEditForm();
        }}
        onSubmit={handleEditSubmit}
        categories={categories}
        isProcessing={updateMutation.isPending}
        isLoadingCategories={isLoadingCategories}
        name={editName}
        setName={setEditName}
        barcode={editBarcode}
        setBarcode={setEditBarcode}
        image={editImage}
        setImage={setEditImage}
        categoryId={editCategoryId}
        setCategoryId={setEditCategoryId}
      />

      <DeleteConfirmationModal 
        isOpen={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ProductsPage; 