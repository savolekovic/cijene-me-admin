import React, { useState } from 'react';
import { StoreBrandDropdownItem } from '../../../domain/interfaces/IStoreBrandRepository';
import { validateStoreLocationAddress } from '../../../../shared/utils/validation';

interface StoreLocationFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  storeBrands: StoreBrandDropdownItem[];
  isProcessing: boolean;
  address: string;
  setAddress: (address: string) => void;
  storeBrandId: number;
  setStoreBrandId: (id: number) => void;
}

export const StoreLocationFormModal: React.FC<StoreLocationFormModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSubmit,
  storeBrands,
  isProcessing,
  address,
  setAddress,
  storeBrandId,
  setStoreBrandId
}) => {
  const [addressError, setAddressError] = useState<string>('');
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    const error = validateStoreLocationAddress(newAddress);
    setAddressError(error || '');
  };

  const handleStoreBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setStoreBrandId(id);
  };

  const submitText = mode === 'add' ? 'Add Store Location' : 'Save Changes';
  const processingText = mode === 'add' ? 'Adding...' : 'Saving...';

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-scrollable modal-fullscreen-sm-down">
        <div className="modal-content">
          <form onSubmit={onSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {mode === 'add' ? 'Add New Store Location' : 'Edit Store Location'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={isProcessing}
              />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="storeBrand" className="form-label">Store Brand</label>
                <select
                  className="form-select"
                  id="storeBrand"
                  value={storeBrandId}
                  onChange={handleStoreBrandChange}
                  disabled={isProcessing}
                >
                  <option value={0}>Select Store Brand</option>
                  {storeBrands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  type="text"
                  className={`form-control ${addressError ? 'is-invalid' : ''}`}
                  id="address"
                  value={address}
                  onChange={handleAddressChange}
                  disabled={isProcessing}
                />
                {addressError && (
                  <div className="invalid-feedback">{addressError}</div>
                )}
              </div>
            </div>
            <div className="modal-footer flex-column flex-sm-row">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={
                  isProcessing || 
                  !!addressError || 
                  !address.trim() || 
                  !storeBrandId
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