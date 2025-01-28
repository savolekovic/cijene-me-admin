import React, { useState, useRef } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { CategoryDropdownItem } from '../../../../categories/domain/interfaces/ICategoriesRepository';
import { validateProductName, validateImageInput, validateEANBarcode } from '../../../../shared/utils/validation';

interface ProductFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  categories: CategoryDropdownItem[];
  isProcessing: boolean;
  isLoadingCategories: boolean;
  name: string;
  setName: (name: string) => void;
  barcode: string;
  setBarcode: (barcode: string) => void;
  image: File | null;
  setImage: (image: File | null) => void;
  categoryId: number;
  setCategoryId: (id: number) => void;
  error?: string;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSubmit,
  categories,
  isProcessing,
  isLoadingCategories,
  name,
  setName,
  barcode,
  setBarcode,
  image,
  setImage,
  categoryId,
  setCategoryId,
  error
}) => {
  const [nameError, setNameError] = useState<string>('');
  const [barcodeError, setBarcodeError] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
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
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const title = mode === 'add' ? 'Add New Product' : 'Edit Product';
  const submitText = mode === 'add' ? 'Create Product' : 'Save Changes';
  const processingText = mode === 'add' ? 'Creating...' : 'Saving...';

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          {isLoadingCategories && (
            <div 
              className="progress rounded-0" 
              style={{ height: '3px', position: 'absolute', width: '100%', top: 0 }}
            >
              <div 
                className="progress-bar progress-bar-striped progress-bar-animated" 
                style={{ width: '100%' }}
              />
            </div>
          )}
          <form onSubmit={onSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={isProcessing || isLoadingCategories}
              />
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger mb-3">
                  {error}
                </div>
              )}
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
                <div className="d-flex flex-column gap-2">
                  {/* Desktop view */}
                  <div className="d-none d-md-flex gap-2">
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
                  
                  {/* Mobile view */}
                  <div className="d-flex d-md-none gap-2">
                    <input
                      type="file"
                      className="d-none"
                      accept="image/jpeg,image/png,image/gif"
                      capture="environment"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                      id="cameraInput"
                    />
                    <input
                      type="file"
                      className="d-none"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                      id="galleryInput"
                    />
                    <button
                      type="button"
                      className="btn btn-primary flex-grow-1"
                      onClick={() => document.getElementById('cameraInput')?.click()}
                      disabled={isProcessing}
                    >
                      Take Photo
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary flex-grow-1"
                      onClick={() => document.getElementById('galleryInput')?.click()}
                      disabled={isProcessing}
                    >
                      Choose from Gallery
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={handleRemoveImage}
                      disabled={isProcessing || !image}
                    >
                      Remove
                    </button>
                  </div>
                  
                  {image && (
                    <div className="text-muted small">
                      Selected: {image.name}
                    </div>
                  )}
                </div>
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
                  disabled={isProcessing || isLoadingCategories}
                >
                  <option value="">
                    {isLoadingCategories ? 'Loading categories...' : 'Select a category'}
                  </option>
                  {!isLoadingCategories && categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {isLoadingCategories && (
                  <div className="mt-2 text-primary">
                    <FaSpinner className="spinner-border spinner-border-sm me-2" />
                    Loading categories...
                  </div>
                )}
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
                  isLoadingCategories ||
                  !!nameError || 
                  !!barcodeError || 
                  !!imageError || 
                  !name.trim() || 
                  !barcode.trim() || 
                  (mode === 'add' && !image) ||
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