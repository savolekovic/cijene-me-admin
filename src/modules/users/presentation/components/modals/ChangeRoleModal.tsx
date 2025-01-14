import React from 'react';
import { User } from '../../../domain/interfaces/IUsersRepository';

interface ChangeRoleModalProps {
  isOpen: boolean;
  user: User | null;
  isChanging: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  isOpen,
  user,
  isChanging,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !user) return null;

  const newRole = user.role.toLowerCase() === 'moderator' ? 'User' : 'Moderator';

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Role Change</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={isChanging}
            />
          </div>
          <div className="modal-body">
            <p>
              Are you sure you want to change {user.full_name}'s role from{' '}
              <strong>{user.role}</strong> to{' '}
              <strong>{newRole}</strong>?
            </p>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isChanging}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-warning" 
              onClick={onConfirm}
              disabled={isChanging}
            >
              {isChanging ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Changing Role...
                </>
              ) : (
                'Change Role'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeRoleModal; 