import React, { useEffect, useState } from 'react';
import { User } from '../../domain/interfaces/IUsersRepository';
import { UsersRepository } from '../../infrastructure/UsersRepository';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaSpinner, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const usersRepository = new UsersRepository();

type SortField = 'id' | 'full_name' | 'email' | 'role' | 'created_at';
type SortOrder = 'asc' | 'desc';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await usersRepository.getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          logout();
          navigate('/');
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [accessToken, navigate, logout]);

  useEffect(() => {
    let filtered = users.filter(user => 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort the filtered results
    filtered = [...filtered].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date comparison
      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it as the sort field and default to asc
      setSortField(field);
      setSortOrder('asc');
    }
  };

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

  if (isLoading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <FaSpinner className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Users Management</h1>
        <button className="btn btn-primary">
          Add New User
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-end">
              <span className="text-muted">
                Total Users: {filteredUsers.length}
              </span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                    ID {getSortIcon('id')}
                  </th>
                  <th onClick={() => handleSort('full_name')} style={{ cursor: 'pointer' }}>
                    Full Name {getSortIcon('full_name')}
                  </th>
                  <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                    Email {getSortIcon('email')}
                  </th>
                  <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
                    Role {getSortIcon('role')}
                  </th>
                  <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
                    Created At {getSortIcon('created_at')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
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
                        >
                          Change Role
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          title="Deactivate user"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No users found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage; 