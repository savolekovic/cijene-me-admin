import React, { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaSort, FaInbox } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { Category } from '../../../categories/domain/interfaces/ICategoriesRepository';
import { Product } from '../../domain/interfaces/IProductsRepository';
import { ProductsRepository } from '../../infrastructure/ProductsRepository';
import { ProductsTable, SortField } from './ProductsTable';
import { ProductFormModal } from './modals/ProductFormModal';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import { CategoriesRepository } from '../../../categories/infrastructure/CategoriesRepository';
import { LoadingSpinner } from '../../../shared/presentation/components/LoadingSpinner';

const productsRepository = new ProductsRepository();
const categoriesRepository = new CategoriesRepository();

type SortOrder = 'asc' | 'desc';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductBarcode, setNewProductBarcode] = useState('');
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [newProductCategoryId, setNewProductCategoryId] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editCategoryId, setEditCategoryId] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productsRepository.getAllProducts(),
          categoriesRepository.getAllCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          logout();
          navigate('/');
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [logout, navigate]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      // Get the response from the API
      const response = await productsRepository.createProduct(
        newProductName,
        newProductBarcode,
        newProductImage!,
        newProductCategoryId
      );
      
      // Find the category object
      const category = categories.find(cat => cat.id === newProductCategoryId);
      
      // Create the product object with the category
      const productWithCategory: Product = {
        id: response.id,
        name: response.name,
        barcode: response.barcode,
        image_url: response.image_url, // This will now be the full Cloudinary URL
        created_at: response.created_at,
        category: category || { id: newProductCategoryId, name: 'Unknown' }
      };
      
      setProducts([...products, productWithCategory]);
      setShowAddModal(false);
      resetAddForm();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsEditing(true);
    try {
      const updatedProduct = await productsRepository.updateProduct(
        editingProduct.id,
        editName,
        editBarcode,
        editImage,
        editCategoryId
      );
      setProducts(products.map(prod =>
        prod.id === updatedProduct.id ? updatedProduct : prod
      ));
      setEditingProduct(null);
      resetEditForm();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setIsEditing(false);
    }
  };

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

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await productsRepository.deleteProduct(deleteId);
      setProducts(products.filter(prod => prod.id !== deleteId));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewProductName('');
    setNewProductBarcode('');
    setNewProductImage(null);
    setNewProductCategoryId(0);
  };

  const handleCloseEditModal = () => {
    setEditingProduct(null);
    setEditName('');
    setEditBarcode('');
    setEditImage(null);
    setEditCategoryId(0);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditBarcode(product.barcode);
    setEditImage(null);
    setEditCategoryId(product.category.id);
  };

  const addProduct = () => {
    setShowAddModal(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid px-3 px-sm-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Products</h1>
        <button
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={() => addProduct()}
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
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '12px' }}
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
            onSort={handleSort}
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

      { /* Add Form Modal */}
      <ProductFormModal
        isOpen={showAddModal}
        mode="add"
        onClose={handleCloseAddModal}
        onSubmit={handleCreateProduct}
        categories={categories}
        isProcessing={isCreating}
        name={newProductName}
        setName={setNewProductName}
        barcode={newProductBarcode}
        setBarcode={setNewProductBarcode}
        image={newProductImage}
        setImage={setNewProductImage}
        categoryId={newProductCategoryId}
        setCategoryId={setNewProductCategoryId}
      />

      { /* Edit Form Modal */}
      <ProductFormModal
        isOpen={!!editingProduct}
        mode="edit"
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        categories={categories}
        isProcessing={isEditing}
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
        isDeleting={isDeleting}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ProductsPage; 