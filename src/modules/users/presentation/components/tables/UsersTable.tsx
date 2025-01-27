import React from 'react';
import { User } from '../../../domain/interfaces/IUsersRepository';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { OrderDirection, UserSortField } from '../../../../shared/types/sorting';

interface UsersTableProps {
  users: User[];
  sortField: UserSortField;
  sortOrder: OrderDirection;
  onSort: (field: UserSortField) => void;
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
  const getSortIcon = (field: UserSortField) => {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />;
    return sortOrder === OrderDirection.ASC ? 
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
                  onClick={() => onSort(UserSortField.FULL_NAME)}
                  className="align-middle"
                >
                  Name
                  {getSortIcon(UserSortField.FULL_NAME)}
                </th>
                <th 
                  style={{ width: '27.5%', padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={() => onSort(UserSortField.EMAIL)}
                  className="align-middle"
                >
                  Email
                  {getSortIcon(UserSortField.EMAIL)}
                </th>
                <th 
                  style={{ width: '10%', padding: '0.5rem 1rem' }}
                  className="align-middle"
                >
                  Role
                </th>
                <th 
                  style={{ width: '15%', padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={() => onSort(UserSortField.CREATED_AT)}
                  className="text-end align-middle"
                >
                  Created At
                  {getSortIcon(UserSortField.CREATED_AT)}
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