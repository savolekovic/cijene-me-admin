import React from 'react';
import { StoreLocationDropdownItem } from '../../../../stores/domain/interfaces/IStoreLocationRepository';
import { StoreBrandDropdownItem } from '../../../../stores/domain/interfaces/IStoreBrandRepository';
import { ProductDropdownItem } from '../../../domain/interfaces/IProductsRepository';

interface ProductEntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  products: ProductDropdownItem[];
  storeBrands: StoreBrandDropdownItem[];
  storeLocations: StoreLocationDropdownItem[];
  isLoadingDropdownData: boolean;
  isProcessing: boolean;
  productId: number;
  setProductId: (id: number) => void;
  storeBrandId: number;
  setStoreBrandId: (id: number) => void;
  locationId: number;
  setLocationId: (id: number) => void;
  price: string;
  setPrice: (price: string) => void;
  mode: 'add' | 'edit';
}

export const ProductEntryFormModal: React.FC<ProductEntryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  storeBrands,
  storeLocations,
  isLoadingDropdownData,
  isProcessing,
  productId,
  setProductId,
  storeBrandId,
  setStoreBrandId,
  locationId,
  setLocationId,
  price,
  setPrice,
  mode
}) => {
  if (!isOpen) return null;

  const title = mode === 'add' ? 'Add Product Entry' : 'Edit Product Entry';
  const submitButtonText = mode === 'add' ? 'Create Product Entry' : 'Save Changes';
  const processingText = mode === 'add' ? 'Creating...' : 'Saving...';

  const handleStoreBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStoreBrandId = Number(e.target.value);
    setStoreBrandId(newStoreBrandId);
    setLocationId(0); // Reset location when store brand changes
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-scrollable modal-fullscreen-sm-down">
        <div className="modal-content">
          {isLoadingDropdownData && (
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
                disabled={isProcessing || isLoadingDropdownData}
              />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="product" className="form-label">Product</label>
                <select
                  className="form-select"
                  id="product"
                  value={productId}
                  onChange={(e) => setProductId(Number(e.target.value))}
                  required
                  disabled={isProcessing || isLoadingDropdownData}
                >
                  <option value="">
                    {isLoadingDropdownData ? 'Loading products...' : 'Select a product'}
                  </option>
                  {!isLoadingDropdownData && products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="storeBrand" className="form-label">Store Brand</label>
                <select
                  className="form-select"
                  id="storeBrand"
                  value={storeBrandId}
                  onChange={handleStoreBrandChange}
                  required
                  disabled={isProcessing || isLoadingDropdownData}
                >
                  <option value="">
                    {isLoadingDropdownData ? 'Loading store brands...' : 'Select a store brand'}
                  </option>
                  {!isLoadingDropdownData && storeBrands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="storeLocation" className="form-label">Store Location</label>
                <select
                  className="form-select"
                  id="storeLocation"
                  value={locationId}
                  onChange={(e) => setLocationId(Number(e.target.value))}
                  required
                  disabled={isProcessing || isLoadingDropdownData || !storeBrandId}
                >
                  <option value="">
                    {!storeBrandId 
                      ? 'Select a store brand first'
                      : isLoadingDropdownData 
                      ? 'Loading locations...' 
                      : 'Select a store location'}
                  </option>
                  {!isLoadingDropdownData && storeBrandId > 0 && storeLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.address}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="price" className="form-label">Price (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  disabled={isProcessing || isLoadingDropdownData}
                  placeholder="Enter price"
                />
              </div>
            </div>
            <div className="modal-footer flex-column flex-sm-row">
              <button
                type="button"
                className="btn btn-secondary w-100 w-sm-auto mb-2 mb-sm-0"
                onClick={onClose}
                disabled={isProcessing || isLoadingDropdownData}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary w-100 w-sm-auto"
                disabled={
                  isProcessing || 
                  isLoadingDropdownData ||
                  !productId || 
                  !storeBrandId ||
                  !locationId || 
                  !price.trim()
                }
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {processingText}
                  </>
                ) : (
                  submitButtonText
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 