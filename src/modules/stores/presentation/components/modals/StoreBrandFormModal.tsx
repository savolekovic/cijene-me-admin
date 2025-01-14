import React, { useState } from 'react';
import { validateStoreBrandName } from '../../../../shared/utils/validation';

interface StoreBrandFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isProcessing: boolean;
  name: string;
  setName: (name: string) => void;
}

export const StoreBrandFormModal: React.FC<StoreBrandFormModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSubmit,
  isProcessing,
  name,
  setName
}) => {
  const [nameError, setNameError] = useState<string>('');
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    const error = validateStoreBrandName(newName);
    setNameError(error || '');
  };

  const submitText = mode === 'add' ? 'Add Store Brand' : 'Save Changes';
  const processingText = mode === 'add' ? 'Adding...' : 'Saving...';

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-scrollable modal-fullscreen-sm-down">
        <div className="modal-content">
          <form onSubmit={onSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {mode === 'add' ? 'Add New Store Brand' : 'Edit Store Brand'}
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
                <label htmlFor="name" className="form-label">Store Brand Name</label>
                <input
                  type="text"
                  className={`form-control ${nameError ? 'is-invalid' : ''}`}
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  disabled={isProcessing}
                />
                {nameError && (
                  <div className="invalid-feedback">{nameError}</div>
                )}
              </div>
            </div>
            <div className="modal-footer flex-column flex-sm-row">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isProcessing || !!nameError || !name.trim()}
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