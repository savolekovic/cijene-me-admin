import React, { useState } from 'react';
import { Category } from '../../../../categories/domain/interfaces/ICategoriesRepository';
import { validateEANBarcode, validateProductName, validateImageUrl } from '../../../../shared/utils/validation';

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
  const [nameError, setNameError] = useState<string>('');
  const [barcodeError, setBarcodeError] = useState<string>('');
  const [imageUrlError, setImageUrlError] = useState<string>('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    const error = validateProductName(newName);
    setNameError(error || '');
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBarcode = e.target.value;
    setBarcode(newBarcode);
    
    if (newBarcode.trim() === '') {
      setBarcodeError('Barcode is required');
    } else if (!/^\d{8}$|^\d{13}$/.test(newBarcode)) {
      setBarcodeError('Barcode must be either 8 or 13 digits');
    } else if (!validateEANBarcode(newBarcode)) {
      setBarcodeError('Invalid EAN barcode check digit');
    } else {
      setBarcodeError('');
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setImageUrl(newUrl);
    const error = validateImageUrl(newUrl);
    setImageUrlError(error || '');
  };

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
                  className={`form-control ${nameError ? 'is-invalid' : ''}`}
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  required
                  disabled={isProcessing}
                  placeholder="Enter product name"
                />
                {nameError && (
                  <div className="invalid-feedback">
                    {nameError}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="barcode" className="form-label">Barcode (EAN-8 or EAN-13)</label>
                <input
                  type="text"
                  className={`form-control ${barcodeError ? 'is-invalid' : ''}`}
                  id="barcode"
                  value={barcode}
                  onChange={handleBarcodeChange}
                  required
                  disabled={isProcessing}
                  placeholder="Enter 8 or 13 digit barcode"
                />
                {barcodeError && (
                  <div className="invalid-feedback">
                    {barcodeError}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="imageUrl" className="form-label">Image URL</label>
                <input
                  type="url"
                  className={`form-control ${imageUrlError ? 'is-invalid' : ''}`}
                  id="imageUrl"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  required
                  disabled={isProcessing}
                  placeholder="Enter image URL"
                />
                {imageUrlError && (
                  <div className="invalid-feedback">
                    {imageUrlError}
                  </div>
                )}
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
                disabled={
                  isProcessing || 
                  !!nameError || 
                  !!barcodeError || 
                  !!imageUrlError || 
                  !name.trim() || 
                  !barcode.trim() || 
                  !imageUrl.trim() || 
                  !categoryId
                }
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