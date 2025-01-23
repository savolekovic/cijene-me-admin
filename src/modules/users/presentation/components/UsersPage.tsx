import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaSearch, FaSort, FaInbox } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { User } from '../../domain/interfaces/IUsersRepository';
import { UsersRepository } from '../../infrastructure/UsersRepository';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { LoadingSpinner } from '../../../shared/presentation/components/LoadingSpinner';
import UsersTable from './tables/UsersTable';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import ChangeRoleModal from './modals/ChangeRoleModal';

const usersRepository = new UsersRepository();

type SortField = 'full_name' | 'email' | 'role' | 'created_at';
type SortOrder = 'asc' | 'desc';

const UsersPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('full_name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [changeRoleUser, setChangeRoleUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query for fetching users
  const { 
    data: users = [], 
    isLoading 
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const data = await usersRepository.getAllUsers();
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }
        return data;
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          logout();
          navigate('/');
        }
        throw err;
      }
    }
  });

  // Mutation for deleting users
  const deleteMutation = useMutation<{ message: string }, Error, number>({
    mutationFn: (userId: number) => usersRepository.deleteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.setQueryData(['users'], (oldData: User[] | undefined) => 
        oldData ? oldData.filter(user => user.id !== userId) : []
      );
      setDeleteUserId(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  });

  // Mutation for changing user role
  const changeRoleMutation = useMutation<User, Error, { userId: number; newRole: string }>({
    mutationFn: ({ userId, newRole }) => 
      usersRepository.changeRole(userId, newRole),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['users'], (oldData: User[] | undefined) =>
        oldData ? oldData.map(user => user.id === updatedUser.id ? updatedUser : user) : []
      );
      setChangeRoleUser(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to change user role');
      setTimeout(() => setError(''), 3000);
    }
  });

  // Filter and sort users
  const filteredUsers = React.useMemo(() => {
    let filtered = users.filter(user => 
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'full_name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role.toLowerCase() === 'moderator' ? 1 : 0;
          bValue = b.role.toLowerCase() === 'moderator' ? 1 : 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, searchQuery, sortField, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('sort-dropdown');
      const button = document.getElementById('sort-button');
      if (
        isDropdownOpen && 
        dropdown && 
        button && 
        !dropdown.contains(event.target as Node) && 
        !button.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

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
    deleteMutation.mutate(deleteUserId);
  };

  const handleChangeRoleClick = (user: User) => {
    setChangeRoleUser(user);
  };

  const handleChangeRoleConfirm = async () => {
    if (!changeRoleUser) return;
    const newRole = changeRoleUser.role.toLowerCase() === 'moderator' ? 'user' : 'moderator';
    changeRoleMutation.mutate({ userId: changeRoleUser.id, newRole });
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Users Management</h1>
      </div>

      <div className="card shadow-sm">
        <div className="card-header border-0 bg-white py-2">
          <div className="row g-3 mb-0">
            <div className="col-12 col-sm-8 col-md-6">
              <div className="d-flex gap-2">
                <div className="input-group flex-grow-1">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search users by name, email or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch 
                    className="position-absolute text-muted" 
                    style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                    size={14}
                  />
                </div>
                <div className="position-relative">
                  <button 
                    id="sort-button"
                    className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <FaSort size={14} />
                    <span className="d-none d-sm-inline">
                      {sortField === 'full_name' 
                        ? `Name (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`
                        : sortField === 'created_at'
                        ? `Date (${sortOrder === 'asc' ? 'Oldest' : 'Newest'})`
                        : sortField === 'role'
                        ? `Role (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`
                        : 'Sort By'}
                    </span>
                  </button>
                  {isDropdownOpen && (
                    <div 
                      id="sort-dropdown"
                      className="position-absolute end-0 mt-1 py-1 bg-white rounded shadow-sm" 
                      style={{ 
                        zIndex: 1000, 
                        minWidth: '160px',
                        border: '1px solid rgba(0,0,0,.15)'
                      }}
                    >
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('full_name'); 
                          setSortOrder('asc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Name (A-Z)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('full_name'); 
                          setSortOrder('desc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Name (Z-A)
                      </button>
                      <div className="dropdown-divider my-1"></div>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('role'); 
                          setSortOrder('asc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Role (User → Moderator)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('role'); 
                          setSortOrder('desc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Role (Moderator → User)
                      </button>
                      <div className="dropdown-divider my-1"></div>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('created_at'); 
                          setSortOrder('desc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Date (Newest)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField('created_at'); 
                          setSortOrder('asc');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Date (Oldest)
                      </button>
                    </div>
                  )}
                </div>
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
        </div>
        <div className="card-body p-0">
          <UsersTable 
            users={filteredUsers}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onDelete={handleDeleteClick}
            onChangeRole={handleChangeRoleClick}
            deletingUsers={deleteMutation.isPending ? [deleteUserId!] : []}
          />

          {filteredUsers.length === 0 && (
            <div className="text-center py-5">
              <div className="text-muted mb-2">
                <FaInbox size={48} />
              </div>
              <h5 className="fw-normal text-muted">
                {searchQuery ? 'No users found matching your search.' : 'No users found.'}
              </h5>
              <p className="text-muted small mb-0">The user list is empty</p>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal 
        isOpen={deleteUserId !== null}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ChangeRoleModal 
        isOpen={changeRoleUser !== null}
        user={changeRoleUser}
        isChanging={changeRoleMutation.isPending}
        onClose={() => setChangeRoleUser(null)}
        onConfirm={handleChangeRoleConfirm}
      />
    </div>
  );
}

export default UsersPage; 