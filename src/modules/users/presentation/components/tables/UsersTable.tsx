import React from 'react';
import { User } from '../../../domain/interfaces/IUsersRepository';
import { FaSort, FaSortUp, FaSortDown, FaUser } from 'react-icons/fa';

type SortField = 'id' | 'full_name' | 'email' | 'role' | 'created_at';
type SortOrder = 'asc' | 'desc';

interface UsersTableProps {
  users: User[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onDelete: (userId: number) => void;
  onChangeRole: (user: User) => void;
  deletingUsers: number[];
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  sortField,
  sortOrder,
  onSort,
  onDelete,
  onChangeRole,
  deletingUsers,
}) => {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />;
    return sortOrder === 'asc' ? 
      <FaSortUp className="ms-1 text-primary" /> : 
      <FaSortDown className="ms-1 text-primary" />;
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'badge rounded-pill bg-danger px-3 py-2 text-uppercase';
      case 'moderator':
        return 'badge rounded-pill bg-warning px-3 py-2 text-uppercase';
      default:
        return 'badge rounded-pill bg-primary px-3 py-2 text-uppercase';
    }
  };

  return (
    <>
      {/* Desktop View */}
      <div className="d-none d-md-block">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th onClick={() => onSort('id')} style={{ cursor: 'pointer' }}>
                  ID {getSortIcon('id')}
                </th>
                <th onClick={() => onSort('full_name')} style={{ cursor: 'pointer' }}>
                  Full Name {getSortIcon('full_name')}
                </th>
                <th onClick={() => onSort('email')} style={{ cursor: 'pointer' }}>
                  Email {getSortIcon('email')}
                </th>
                <th onClick={() => onSort('role')} style={{ cursor: 'pointer' }}>
                  Role {getSortIcon('role')}
                </th>
                <th onClick={() => onSort('created_at')} style={{ cursor: 'pointer' }}>
                  Created At {getSortIcon('created_at')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={getRoleBadgeClass(user.role)} style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group">
                      <button 
                        className="btn btn-sm btn-outline-warning"
                        title="Change user role"
                        onClick={() => onChangeRole(user)}
                        disabled={user.role === 'admin'}
                      >
                        Change Role
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        title="Delete user"
                        onClick={() => onDelete(user.id)}
                        disabled={deletingUsers.includes(user.id)}
                      >
                        {deletingUsers.includes(user.id) ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" />
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="d-md-none">
        {Array.isArray(users) && users.map((user) => (
          <div key={user.id} className="card mb-3 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-start gap-3 mb-3">
                <div className="bg-light rounded-circle p-2">
                  <FaUser className="text-primary" size={24} />
                </div>
                <div className="flex-grow-1">
                  <h6 className="card-subtitle mb-1 text-muted">#{user.id}</h6>
                  <h5 className="card-title mb-0">{user.full_name}</h5>
                </div>
              </div>

              <div className="mb-2">
                <strong>Email:</strong> {user.email}
              </div>

              <div className="mb-3">
                <span className={getRoleBadgeClass(user.role)} style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                  {user.role}
                </span>
              </div>

              <div className="mb-3 text-muted small">
                <i>Added on {new Date(user.created_at).toLocaleDateString()}</i>
              </div>

              <div className="d-grid gap-2">
                <button 
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => onChangeRole(user)}
                  disabled={user.role === 'admin'}
                >
                  Change Role
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete(user.id)}
                  disabled={deletingUsers.includes(user.id)}
                >
                  {deletingUsers.includes(user.id) ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!Array.isArray(users) || users.length === 0) && (
          <div className="text-center py-4">
            <p className="text-muted">No users found matching your search criteria.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default UsersTable; 