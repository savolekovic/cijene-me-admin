import React, { useEffect, useState } from 'react';
import { User } from '../../domain/interfaces/IUsersRepository';
import { UsersRepository } from '../../infrastructure/UsersRepository';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { LoadingSpinner } from '../../../shared/presentation/components/LoadingSpinner';
import UsersTable from './tables/UsersTable';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import ChangeRoleModal from './modals/ChangeRoleModal';

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
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deletingUsers, setDeletingUsers] = useState<number[]>([]);
  const [changeRoleUser, setChangeRoleUser] = useState<User | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await usersRepository.getAllUsers();
        if (Array.isArray(data)) {
          setUsers(data);
          setFilteredUsers(data);
        } else {
          console.error('Received non-array data:', data);
          setError('Invalid data format received from server');
          setUsers([]);
          setFilteredUsers([]);
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          logout();
          navigate('/');
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setUsers([]);
          setFilteredUsers([]);
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
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteClick = (userId: number) => {
    setDeleteUserId(userId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return;
    
    setDeletingUsers(prev => [...prev, deleteUserId]);
    try {
      await usersRepository.deleteUser(deleteUserId);
      setUsers(users.filter(user => user.id !== deleteUserId));
      setFilteredUsers(filteredUsers.filter(user => user.id !== deleteUserId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeletingUsers(prev => prev.filter(id => id !== deleteUserId));
      setDeleteUserId(null);
    }
  };

  const handleChangeRoleClick = (user: User) => {
    setChangeRoleUser(user);
  };

  const handleChangeRoleConfirm = async () => {
    if (!changeRoleUser) return;
    
    setIsChangingRole(true);
    try {
      const newRole = changeRoleUser.role.toLowerCase() === 'moderator' ? 'user' : 'moderator';
      const updatedUser = await usersRepository.changeRole(changeRoleUser.id, newRole);
      
      setUsers(users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      setFilteredUsers(filteredUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change user role');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsChangingRole(false);
      setChangeRoleUser(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid px-3 px-sm-4 py-4">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          />
        </div>
      )}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <h1 className="h3 mb-0">Users Management</h1>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-8 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search users by name, email or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-sm-4 col-md-6">
              <div className="d-flex justify-content-start justify-content-sm-end align-items-center h-100">
                <span className="badge bg-secondary">
                  Total Users: {filteredUsers.length}
                </span>
              </div>
            </div>
          </div>

          <UsersTable 
            users={filteredUsers}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onDelete={handleDeleteClick}
            onChangeRole={handleChangeRoleClick}
            deletingUsers={deletingUsers}
          />

          {filteredUsers.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted mb-0">
                {searchTerm ? 'No users found matching your search.' : 'No users found.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal 
        isOpen={deleteUserId !== null}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        isDeleting={deletingUsers.includes(deleteUserId || -1)}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ChangeRoleModal 
        isOpen={changeRoleUser !== null}
        user={changeRoleUser}
        isChanging={isChangingRole}
        onClose={() => setChangeRoleUser(null)}
        onConfirm={handleChangeRoleConfirm}
      />
    </div>
  );
};

export default UsersPage; 