import React, { useState, useRef } from 'react';
import { Category } from '../../../../categories/domain/interfaces/ICategoriesRepository';
import { validateProductName, validateImageInput, validateEANBarcode } from '../../../../shared/utils/validation';

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
  image: File | null;
  setImage: (image: File | null) => void;
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
  image,
  setImage,
  categoryId,
  setCategoryId
}) => {
  const [nameError, setNameError] = useState<string>('');
  const [barcodeError, setBarcodeError] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
      const error = validateImageInput(file);
      setImageError(error || '');
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Initialize preview when modal opens
  React.useEffect(() => {
    if (isOpen && image) {
      const previewUrl = URL.createObjectURL(image);
      setImagePreview(previewUrl);
    }
  }, [isOpen, image]);

  if (!isOpen) return null;

  const title = mode === 'add' ? 'Add New Product' : 'Edit Product';
  const submitText = mode === 'add' ? 'Create Product' : 'Save Changes';
  const processingText = mode === 'add' ? 'Creating...' : 'Saving...';

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-scrollable modal-fullscreen-sm-down">
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
                <label className="form-label">Product Image</label>
                <div className="d-flex gap-2 mb-2">
                  <input
                    type="file"
                    className={`form-control ${imageError ? 'is-invalid' : ''}`}
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                    ref={fileInputRef}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleRemoveImage}
                    disabled={isProcessing || !image}
                  >
                    Remove
                  </button>
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="img-thumbnail"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}
                {imageError && (
                  <div className="invalid-feedback d-block">
                    {imageError}
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
            <div className="modal-footer flex-column flex-sm-row">
              <button
                type="button"
                className="btn btn-secondary w-100 w-sm-auto mb-2 mb-sm-0"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary w-100 w-sm-auto"
                disabled={
                  isProcessing || 
                  !!nameError || 
                  !!barcodeError || 
                  !!imageError || 
                  !name.trim() || 
                  !barcode.trim() || 
                  !image || 
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