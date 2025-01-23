import React from 'react';
import { User } from '../../../domain/interfaces/IUsersRepository';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';

interface UsersTableProps {
  users: User[];
  sortField: 'full_name' | 'email' | 'role' | 'created_at';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'full_name' | 'email' | 'role' | 'created_at') => void;
  onDelete: (id: number) => void;
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
  deletingUsers
}) => {
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />;
    return sortOrder === 'asc' ? 
      <FaSortUp className="ms-1 text-primary" /> : 
      <FaSortDown className="ms-1 text-primary" />;
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
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
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="border-bottom">
                <th 
                  style={{ width: '27.5%', padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={() => onSort('full_name')}
                  className="align-middle"
                >
                  Name
                </th>
                <th 
                  style={{ width: '27.5%', padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={() => onSort('email')}
                  className="align-middle"
                >
                  Email
                </th>
                <th 
                  style={{ width: '10%', padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={() => onSort('role')}
                  className="align-middle"
                >
                  Role
                </th>
                <th 
                  style={{ width: '15%', padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={() => onSort('created_at')}
                  className="text-end align-middle"
                >
                  Created At
                </th>
                <th 
                  style={{ width: '15%', padding: '0.5rem 1rem' }}
                  className="text-end align-middle"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-bottom">
                  <td className="align-middle" style={{ padding: '0.5rem 1rem' }}>
                    {user.full_name}
                  </td>
                  <td className="align-middle" style={{ padding: '0.5rem 1rem' }}>
                    {user.email}
                  </td>
                  <td className="align-middle" style={{ padding: '0.5rem 1rem' }}>
                    <span className={getRoleBadgeClass(user.role)} style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="text-end align-middle" style={{ padding: '0.5rem 1rem' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-end align-middle" style={{ padding: '0.5rem 1rem' }}>
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onChangeRole(user)}
                      >
                        Change Role
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(user.id)}
                        disabled={deletingUsers.includes(user.id)}
                      >
                        {deletingUsers.includes(user.id) ? 'Deleting...' : 'Delete'}
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
        {users.map((user) => (
          <div key={user.id} className="card mb-3">
            <div className="card-body">
              <div className="d-flex flex-column mb-3">
                <h5 className="card-title mb-1">{user.full_name}</h5>
                <div className="text-muted small mb-2">{user.email}</div>
                <div className="d-flex align-items-center gap-2">
                  <span className={getRoleBadgeClass(user.role)}>
                    {user.role}
                  </span>
                  <span className="text-muted small">
                    Added on {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary flex-grow-1"
                  onClick={() => onChangeRole(user)}
                >
                  Change Role
                </button>
                <button
                  className="btn btn-sm btn-outline-danger flex-grow-1"
                  onClick={() => onDelete(user.id)}
                  disabled={deletingUsers.includes(user.id)}
                >
                  {deletingUsers.includes(user.id) ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default UsersTable; 