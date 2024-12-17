import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Product } from '../../../domain/interfaces/IProductsRepository';
import { StoreLocation } from '../../../../stores/domain/interfaces/IStoreLocationRepository';

interface AddProductEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  products: Product[];
  storeLocations: StoreLocation[];
  isLoadingDropdownData: boolean;
  isCreating: boolean;
  productId: number;
  setProductId: (id: number) => void;
  locationId: number;
  setLocationId: (id: number) => void;
  price: string;
  setPrice: (price: string) => void;
}

export const AddProductEntryModal: React.FC<AddProductEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  storeLocations,
  isLoadingDropdownData,
  isCreating,
  productId,
  setProductId,
  locationId,
  setLocationId,
  price,
  setPrice
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          {isLoadingDropdownData ? (
            <div className="modal-body text-center p-4">
              <FaSpinner className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-2">Loading form data...</p>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Add Product Entry</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  disabled={isCreating}
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
                    disabled={isCreating}
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
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
                    disabled={isCreating}
                  >
                    <option value="">Select a store location</option>
                    {storeLocations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.address} ({location.store_brand.name})
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
                    disabled={isCreating}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isCreating || !productId || !locationId || !price}
                >
                  {isCreating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Product Entry'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}; 