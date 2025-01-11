import React, { useEffect, useState } from 'react';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { Category } from '../../../categories/domain/interfaces/ICategoriesRepository';
import { Product } from '../../domain/interfaces/IProductsRepository';
import { ProductsRepository } from '../../infrastructure/ProductsRepository';
import { ProductsTable, SortField } from './ProductsTable';
import { ProductFormModal } from './modals/ProductFormModal';
import { DeleteConfirmationModal } from './modals/DeleteConfirmationModal';
import { CategoriesRepository } from '../../../categories/infrastructure/CategoriesRepository';

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
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  const [newProductCategoryId, setNewProductCategoryId] = useState<number>(0);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

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
      const newProduct = await productsRepository.createProduct(
        newProductName,
        newProductBarcode,
        newProductImageUrl,
        newProductCategoryId
      );
      
      // Find the category object
      const category = categories.find(cat => cat.id === newProductCategoryId);
      
      // Add the category to the product object
      const productWithCategory = {
        ...newProduct,
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
        editImageUrl,
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
    setNewProductImageUrl('');
    setNewProductCategoryId(0);
  };

  const resetEditForm = () => {
    setEditName('');
    setEditBarcode('');
    setEditImageUrl('');
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
    setNewProductImageUrl('');
    setNewProductCategoryId(0);
  };

  const handleCloseEditModal = () => {
    setEditingProduct(null);
    setEditName('');
    setEditBarcode('');
    setEditImageUrl('');
    setEditCategoryId(0);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditBarcode(product.barcode);
    setEditImageUrl(product.image_url);
    setEditCategoryId(product.category.id);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <FaSpinner className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Products Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Add Product
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <ProductsTable
            products={products}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEditClick}
            onDelete={setDeleteId}
          />

          {products.length === 0 && !error && (
            <div className="text-center py-4">
              <p className="text-muted">No products found.</p>
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
        imageUrl={newProductImageUrl}
        setImageUrl={setNewProductImageUrl}
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
        imageUrl={editImageUrl}
        setImageUrl={setEditImageUrl}
        categoryId={editCategoryId}
        setCategoryId={setEditCategoryId}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProductsPage; 