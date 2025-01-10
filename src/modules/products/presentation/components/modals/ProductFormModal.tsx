import React from 'react';
import { Category } from '../../../../categories/domain/interfaces/ICategoriesRepository';

interface ProductFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  categories: Category[];
  isProcessing: boolean;
  name: string;
  setName: (name: string) => void;
  barcode: string;
  setBarcode: (barcode: string) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  categoryId: number;
  setCategoryId: (id: number) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSubmit,
  categories,
  isProcessing,
  name,
  setName,
  barcode,
  setBarcode,
  imageUrl,
  setImageUrl,
  categoryId,
  setCategoryId
}) => {
  if (!isOpen) return null;

  const title = mode === 'add' ? 'Add New Product' : 'Edit Product';
  const submitText = mode === 'add' ? 'Create Product' : 'Save Changes';
  const processingText = mode === 'add' ? 'Creating...' : 'Saving...';

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={onSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={isProcessing}
              />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isProcessing}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="barcode" className="form-label">Barcode</label>
                <input
                  type="text"
                  className="form-control"
                  id="barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  required
                  disabled={isProcessing}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="imageUrl" className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  disabled={isProcessing}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="categoryId" className="form-label">Category</label>
                <select
                  className="form-select"
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  required
                  disabled={isProcessing}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isProcessing || !name.trim() || !imageUrl.trim() || !categoryId}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {processingText}
                  </>
                ) : (
                  submitText
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 