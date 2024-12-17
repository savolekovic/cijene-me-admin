import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Product } from '../../../domain/interfaces/IProductsRepository';
import { StoreLocation } from '../../../../stores/domain/interfaces/IStoreLocationRepository';

interface EditProductEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  products: Product[];
  storeLocations: StoreLocation[];
  isLoadingDropdownData: boolean;
  isEditing: boolean;
  editProductId: number;
  setEditProductId: (id: number) => void;
  editStoreLocationId: number;
  setEditStoreLocationId: (id: number) => void;
  editPrice: string;
  setEditPrice: (price: string) => void;
}

export const EditProductEntryModal: React.FC<EditProductEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  storeLocations,
  isLoadingDropdownData,
  isEditing,
  editProductId,
  setEditProductId,
  editStoreLocationId,
  setEditStoreLocationId,
  editPrice,
  setEditPrice
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
                <h5 className="modal-title">Edit Product Entry</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  disabled={isEditing}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="editProduct" className="form-label">Product</label>
                  <select
                    className="form-select"
                    id="editProduct"
                    value={editProductId}
                    onChange={(e) => setEditProductId(Number(e.target.value))}
                    required
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
                  <label htmlFor="editStoreLocation" className="form-label">Store Location</label>
                  <select
                    className="form-select"
                    id="editStoreLocation"
                    value={editStoreLocationId}
                    onChange={(e) => setEditStoreLocationId(Number(e.target.value))}
                    required
                  >
                    <option value="">Select a store location</option>
                    {storeLocations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.address}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="editPrice" className="form-label">Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    id="editPrice"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isEditing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isEditing || !editProductId || !editStoreLocationId || !editPrice}
                >
                  {isEditing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
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