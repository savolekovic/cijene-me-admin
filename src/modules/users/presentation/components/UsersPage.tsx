import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaSearch, FaSort, FaInbox } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { User } from '../../domain/interfaces/IUsersRepository';
import { UsersRepository } from '../../infrastructure/UsersRepository';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import UsersTable from './tables/UsersTable';
import DeleteConfirmationModal from '../../../shared/presentation/components/modals/DeleteConfirmationModal';
import ChangeRoleModal from './modals/ChangeRoleModal';
import { OrderDirection, UserSortField } from '../../../shared/types/sorting';
import { useDebounceSearch } from '../../../shared/hooks/useDebounceSearch';
import { TableLoadingSpinner } from '../../../shared/presentation/components/TableLoadingSpinner';

const usersRepository = new UsersRepository();

const UsersPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const { searchQuery, debouncedSearchQuery, setSearchQuery } = useDebounceSearch();
  const [sortField, setSortField] = useState<UserSortField>(UserSortField.FULL_NAME);
  const [sortOrder, setSortOrder] = useState<OrderDirection>(OrderDirection.ASC);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [changeRoleUser, setChangeRoleUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query for fetching users
  const { 
    data: usersResponse,
    isLoading 
  } = useQuery({
    queryKey: ['users', debouncedSearchQuery, currentPage, pageSize, sortField, sortOrder],
    queryFn: async () => {
      try {
        const data = await usersRepository.getAllUsers(debouncedSearchQuery, currentPage, pageSize, sortField, sortOrder);
        if (!data || typeof data.total_count !== 'number' || !Array.isArray(data.data)) {
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

  const users = usersResponse?.data || [];
  const totalCount = usersResponse?.total_count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Reset to first page when search query or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, pageSize]);

  // Mutation for deleting users
  const deleteMutation = useMutation<{ message: string }, Error, number>({
    mutationFn: (userId: number) => usersRepository.deleteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.setQueryData(['users', debouncedSearchQuery, currentPage, pageSize], (oldData: any) => {
        if (!oldData) return { total_count: 0, data: [] };
        return {
          total_count: oldData.total_count - 1,
          data: oldData.data.filter((user: User) => user.id !== userId)
        };
      });
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
      queryClient.setQueryData(['users', debouncedSearchQuery, currentPage, pageSize], (oldData: any) => {
        if (!oldData) return { total_count: oldData.total_count, data: [updatedUser] };
        return {
          total_count: oldData.total_count,
          data: oldData.data.map((user: User) => user.id === updatedUser.id ? updatedUser : user)
        };
      });
      setChangeRoleUser(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to change user role');
      setTimeout(() => setError(''), 3000);
    }
  });

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

  const handleSort = (field: UserSortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === OrderDirection.ASC ? OrderDirection.DESC : OrderDirection.ASC);
    } else {
      setSortField(field);
      setSortOrder(OrderDirection.ASC);
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

  return (
    <div className="container-fluid px-3 px-sm-4 py-4">
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
                      {sortField === UserSortField.FULL_NAME 
                        ? `Name (${sortOrder === OrderDirection.ASC ? 'A-Z' : 'Z-A'})`
                        : sortField === UserSortField.CREATED_AT
                        ? `Date (${sortOrder === OrderDirection.ASC ? 'Oldest' : 'Newest'})`
                        : sortField === UserSortField.EMAIL
                        ? `Email (${sortOrder === OrderDirection.ASC ? 'A-Z' : 'Z-A'})`
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
                          setSortField(UserSortField.FULL_NAME); 
                          setSortOrder(OrderDirection.ASC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Name (A-Z)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(UserSortField.FULL_NAME); 
                          setSortOrder(OrderDirection.DESC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Name (Z-A)
                      </button>
                      <div className="dropdown-divider my-1"></div>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(UserSortField.EMAIL); 
                          setSortOrder(OrderDirection.ASC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Email (A-Z)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(UserSortField.EMAIL); 
                          setSortOrder(OrderDirection.DESC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Email (Z-A)
                      </button>
                      <div className="dropdown-divider my-1"></div>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(UserSortField.CREATED_AT); 
                          setSortOrder(OrderDirection.DESC);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Date (Newest)
                      </button>
                      <button 
                        className="dropdown-item px-3 py-1 text-start w-100 border-0 bg-transparent"
                        onClick={() => { 
                          setSortField(UserSortField.CREATED_AT); 
                          setSortOrder(OrderDirection.ASC);
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
              <div className="d-flex justify-content-start justify-content-sm-end align-items-center h-100 gap-2">
                <select 
                  className="form-select" 
                  style={{ width: 'auto' }}
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                </select>
                <span className="badge bg-secondary">
                  Total Users: {totalCount}
                </span>
              </div>
            </div>
          </div>
          {error && (
            <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')} />
            </div>
          )}
        </div>
        
        {isLoading ? (
          <TableLoadingSpinner />
        ) : (
          <>
            <UsersTable 
              users={users}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              onDelete={handleDeleteClick}
              onChangeRole={handleChangeRoleClick}
              deletingUsers={deleteMutation.isPending ? [deleteUserId!] : []}
            />

            {users.length === 0 && !error && (
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
          </>
        )}
        
        <div className="card-footer bg-white border-0 py-3">
          <div className="d-flex justify-content-center align-items-center gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="mx-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
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